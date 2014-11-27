all: test_http_client multi_thread

test_http_client:
	g++ -std=c++11 test_http_client.cc http_client.cc -o test_http_client.exe -levent

multi_thread:
	gcc -c -g event_msgqueue.c
	g++ -g multi_thread.cc event_msgqueue.o -o multi_thread.exe -levent -lpthread

clean:
	rm -f *.o a.out *.exe
