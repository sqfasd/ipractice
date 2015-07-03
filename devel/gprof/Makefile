all: gprof-helper

gprof-helper:
	gcc -shared -fPIC gprof-helper.c -o gprof-helper.so -lpthread -ldl

clean:
	rm -f *.exe *.o *.so *.a
