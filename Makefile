build:
	cp -R ../common .
	docker build -t adrianfish/dialang-web .
	rm -R common/
