#ifndef PROMISE_H_
#define PROMISE_H_

#include <functional>
#include <deque>
#include <type_traits>
#include "logging.h"

using std::function;
using std::string;
using std::deque;

typedef string Error;

namespace base {

template<typename R, typename...Args>
class Resolver {
 public:
  Resolver(function<R(Args...) f) : f_(f) {
  }
  R operator()(Args...) {
    return f_(Args...);
  }
 private:
  function<R(Args...)> f_;
};

class Promise {
};

template <typename R> 
class PromiseImpl : public Promise {
 public:
  PromiseImpl() : state_(PENDING) {
  }

  virtual ~PromiseImpl() {
    LOG(INFO) << "~PromiseImpl";
  }

  Promise* Then(Promise* next) {
    next_ = next;
    return next_;
  }

  template<typename NR, typename...Args>
  Promise* Then(function<NR(Args...)> f) {
    auto resolver = new Resolver<NR, Args>(f);
    resolves_.push_back(resolver);
    return this;
  }

  template<typename R1, typename...Args>
  void Resolve(Args... args) {
    while (!resolves_.empty()) {
      Resolver* resolver = resolvers_.front();
      R1 r = (*resolver)(args);
      resolvers_.pop_front();
    }
    delete this;
  }

  void Reject(string error) {
    state_ = REJECTED;
    CHECK(fail_) << "no handler for the error: " << error;
    fail_(error);
    delete this;
  }

  Promise* Fail(function<void (string)> f) {
    on_reject_ = f;
  }

 private:
  Promise* next_;
  deque<Resolver*> resolvers_;
  enum State {
    PENDING,
    RESOLVED,
    REJECTED,
  } state_;
};

template<>
class PromiseImpl<void> {
};

template<typename RC>
static function<PromiseImpl<RC>* ()> PromiseIfy(
    function<void (function<void(Error, RC))> f) {
  return [f]() {
    auto p = new PromiseImpl<RC>();
    f([p](Error e, RC r) {
      if (e.empty()) {
        p->Resolve(r);
      } else {
        p->Reject(e);
      }
    });
    return p;
  };
}

static function<PromiseImpl<void>* ()> PromiseIfy(
    function<void (function<void(Error))> f) {
  return [f]() {
    auto p = new PromiseImpl<void>();
    f([p](Error e) {
      if (e.empty()) {
        p->Resolve();
      } else {
        p->Reject(e);
      }
    });
    return p;
  };
}

}  // namespace base

#endif  // PROMISE_H_
