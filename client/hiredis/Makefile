all: sub_pub

sub_pub:
	g++ -std=c++11 -static sub_pub.cc -o sub_pub.exe -L ./hiredis -lhiredis -levent

clean:
	rm -f *.exe
