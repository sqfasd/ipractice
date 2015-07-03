# gprof basic usage

1. add ```-pg`` to linker flags or
   ```SET(CMAKE_EXE_LINKER_FLAGS -pg)``` in cmake
2. run the your_program
3. gprof -b your_program [gmon.out]

# multi-thread gprof usage

```bash
make gprof-helper
 LD_PRELOAD=./gprof-helper.so your_program
```

# graphics view

```bash
apt-get install xdot
gprof -b your_program | gprof2dot.py -n0.1 -e0.1 -s | xdot
```
