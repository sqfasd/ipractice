#ifndef HTTP_CLIENT_H_
#define HTTP_CLIENT_H_

#include <assert.h>
#include <event.h>
#include <evhttp.h>
#include <string>
#include <functional>
#include <memory>

struct HttpRequestOption {
  std::string host;
  int port;
  std::string method;
  std::string path;
  std::string data;
};

class HttpClient;
typedef std::function<void (const HttpClient*, const std::string&)> RequestDoneCallback;
typedef std::function<void (const HttpClient*, const std::string&)> ChunkCallback;

class HttpClient {
 public:
  HttpClient(struct event_base* evbase, const HttpRequestOption& option);
  ~HttpClient();
  void SetRequestDoneCallback(RequestDoneCallback cb) {
    request_done_cb_ = cb;
  }
  void SetChunkCallback(ChunkCallback cb) {
    chunk_cb_ = cb;
  }
  void StartRequest();

 private:
  static void OnRequestDone(struct evhttp_request* req, void* ctx);
  static void OnChunk(struct evhttp_request* req, void* ctx);

  struct event_base* evbase_;
  const HttpRequestOption option_;
  struct evhttp_connection* evconn_;
  struct evhttp_request* evreq_;
  RequestDoneCallback request_done_cb_;
  ChunkCallback chunk_cb_;
};
#endif  // HTTP_CLIENT_H_
