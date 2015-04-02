#ifndef NONCOPYABLE_H_
#define NONCOPYABLE_H_

class NonCopyable {
 public:
  NonCopyable& operator=(const NonCopyable&) = delete;
  NonCopyable(const NonCopyable&) = delete;

 protected:
  NonCopyable() = default;
  ~NonCopyable() = default;
};

#endif  // NONCOPYABLE_H_
