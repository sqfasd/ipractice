#include "http_client.h"
#include <string.h>

using std::string;

HttpClient::HttpClient(struct event_base* evbase,
    const HttpRequestOption& option)
    : evbase_(evbase),
      evconn_(NULL),
      evreq_(NULL),
      option_(option) {
}

HttpClient::~HttpClient() {
}

void HttpClient::StartRequest() {
  /*
  struct evhttp_connection* evcon = evhttp_connection_base_new(base, NULL, client->host, client->port);
  */
  evconn_ = evhttp_connection_base_new(evbase_,
                                       NULL,
                                       option_.host.c_str(),
                                       option_.port);

  evreq_ = evhttp_request_new(&HttpClient::OnRequestDone, this);
  evhttp_request_set_chunked_cb(evreq_, &HttpClient::OnChunk);

  struct evkeyvalq* output_headers = evhttp_request_get_output_headers(evreq_);
  evhttp_add_header(output_headers, "Host", option_.host.c_str());

  enum evhttp_cmd_type cmd = EVHTTP_REQ_GET;
  if (option_.method == "post") {
    cmd = EVHTTP_REQ_POST;
  } else {
    // TODO other http methods
  }
  if (cmd == EVHTTP_REQ_POST && !option_.data.empty()) {
    evbuffer_add(evreq_->output_buffer,
                 option_.data.c_str(),
                 option_.data.length());
    evhttp_add_header(output_headers,
                      "Content-Type",
                      "application/x-www-form-urlencoded");
    fprintf(stdout, "post data: %s\n", option_.data.c_str());
  }

  const char* uri = option_.path.empty() ? "/" : option_.path.c_str();
  int ret = evhttp_make_request(evconn_, evreq_, cmd, uri);
  if (ret != 0) {
    fprintf(stderr, "evhttp_make_request() failed\n");
  }
}

void HttpClient::OnRequestDone(struct evhttp_request* req, void* ctx) {
  HttpClient* self = (HttpClient*)ctx;
  int code = 0;
  if (req == NULL || (code = evhttp_request_get_response_code(req)) == 0) {
    int errcode = EVUTIL_SOCKET_ERROR();
    fprintf(stderr, "request failed: %s (%d)\n",
            evutil_socket_error_to_string(errcode), errcode);
    return;
  }
  if (code != 200) {
    fprintf(stderr, "failed with return code: %d\n", code);
    return;
  }

  fprintf(stdout, "request sucess:\n");

  struct evbuffer* evbuf = evhttp_request_get_input_buffer(req);   
  int len = evbuffer_get_length(evbuf);
  std::shared_ptr<string> buffer(new string());
  buffer->reserve(len+1);
  buffer->append((char*)evbuffer_pullup(evbuf, -1), len);
  if (self->request_done_cb_) {
    self->request_done_cb_(self, *buffer.get());
  }
}

void HttpClient::OnChunk(struct evhttp_request* req, void* ctx) {
  fprintf(stdout, "on chunker: \n");
  HttpClient* self = (HttpClient*)ctx;
  struct evbuffer* evbuf = evhttp_request_get_input_buffer(req);   
  int len = evbuffer_get_length(evbuf);
  std::shared_ptr<string> buffer(new string());
  buffer->reserve(len+1);
  buffer->append((char*)evbuffer_pullup(evbuf, -1), len);
  if (self->chunk_cb_) {
    self->chunk_cb_(self, *buffer.get());
  }
}
