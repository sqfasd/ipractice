#ifndef NONCOPYABLE_H_
#define NONCOPYABLE_H_

namespace base {

class NonCopyable {
 public:
  NonCopyable& operator=(const NonCopyable&) = delete;
  NonCopyable(const NonCopyable&) = delete;

 protected:
  NonCopyable() = default;
  ~NonCopyable() = default;
};

}  // namespace base
#endif  // NONCOPYABLE_H_
