#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <errno.h>
#include <string.h>
#include <event2/bufferevent.h>
#include <event2/buffer.h>
#include <event2/listener.h>
#include <event2/util.h>
#include <event2/http.h>

static struct event_base *base;

static void http_request_done(struct evhttp_request *req, void *ctx) {
	char buffer[256];
	int nread;

  if (req == NULL) {
    /* If req is NULL, it means an error occursurred, but
     *  * sadly we are mostly left guessing what the error
     *   * mainight have been.  We'll do our best... */
    int errcode = EVUTIL_SOCKET_ERROR();
    fprintf(stdout, "socket error = %s (%d)\n",
            evutil_socket_error_to_string(errcode),
            errcode);
    return;
  }

	fprintf(stdout, "Response line: %d\n",
	    evhttp_request_get_response_code(req));

	while ((nread = evbuffer_remove(evhttp_request_get_input_buffer(req),
		    buffer, sizeof(buffer)))
	       > 0) {
		fwrite(buffer, nread, 1, stdout);
	}
}

void http_chunk_cb(struct evhttp_request* req, void* arg) {
  printf("http_chunk_cb:\n");
  char buffer[256];
  int nread;
	while ((nread = evbuffer_remove(evhttp_request_get_input_buffer(req),
		    buffer, sizeof(buffer)))
	       > 0) {
		fwrite(buffer, nread, 1, stdout);
	}
}

void request(char* host, int port, char* uri, int i) {
  // TODO error checking
  struct bufferevent *bev = bufferevent_socket_new(base, -1, BEV_OPT_CLOSE_ON_FREE);
  struct evhttp_connection* evcon = evhttp_connection_base_new(base, NULL, host, port);
  struct evhttp_request *req = evhttp_request_new(http_request_done, NULL);
  evhttp_request_set_chunked_cb(req, http_chunk_cb);
  struct evkeyvalq* output_headers = evhttp_request_get_output_headers(req);
  evhttp_add_header(output_headers, "Host", host);
  evhttp_add_header(output_headers, "Connection", "close");
  int ret = evhttp_make_request(evcon, req, EVHTTP_REQ_GET, uri);
  if (ret != 0) {
    fprintf(stderr, "evhttp_make_request() failed\n");
  }
}

int main(int argc, char* argv[]) {
  if (argc != 5) {
    printf("usage: %s <host> <port> <path> <count>\n", argv[0]);
    return 0;
  }
  base = event_base_new();
  assert(base);

  char* host = argv[1];
  int port = atoi(argv[2]);
  char* uri = argv[3];
  int count = atoi(argv[4]);
  for (int i = 0; i < count; ++i) {
    request(host, port, uri, i);
  }

  event_base_dispatch(base);

  event_base_free(base);
}
