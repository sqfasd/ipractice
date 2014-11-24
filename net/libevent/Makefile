all: http_client multi_thread

http_client:
	g++ http_client.cc -o http_client.exe -levent

multi_thread:
	gcc -c -g event_msgqueue.c
	g++ -g multi_thread.cc event_msgqueue.o -o multi_thread.exe -levent -lpthread

clean:
	rm -f *.o a.out *.exe
