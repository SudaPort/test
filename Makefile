ARGS = $(filter-out $@,$(MAKECMDGOALS))
MAKEFLAGS += --silent
CONTAINERS = $(shell docker ps -a -q)
ROOT   =  $(realpath $(PWD))
HTDOCS =  $(realpath $(PWD))/htdocs
VOLUMES = $(shell docker volume ls |awk 'NR>1 {print $2}')
list:
	sh -c "echo; $(MAKE) -p no_targets__ | awk -F':' '/^[a-zA-Z0-9][^\$$#\/\\t=]*:([^=]|$$)/ {split(\$$1,A,/ /);for(i in A)print A[i]}' | grep -v '__\$$' | grep -v 'Makefile'| sort"

#############################
# Docker machine states
#############################

start:
	docker-compose start

stop:
	docker-compose stop

state:
	docker-compose ps

functest:
	docker rm -f func-test || true
	@if [ ! -f ./.env ]; then\
  	read -p "Enter master seed:" master_seed; echo "MASTER_SEED=$$master_seed" >> ./.env; \
  	read -p "Enter master public key:" master_key; echo "MASTER_KEY=$$master_key" >> ./.env; \
  	read -p "Enter horizon host (with protocol and port [optional]):" horizon_host; echo "HORIZON_HOST=$$horizon_host" >> ./.env; \
  	read -p "Enter api host (with protocol and port [optional]):" api_host; echo "API_HOST=$$api_host" >> ./.env; \
  	read -p "Enter stellar network:" stellar_network; echo "STELLAR_NETWORK=$$stellar_network" >> ./.env; \
  	read -p "Enter asset:" asset; echo "ASSET=$$asset" >> ./.env; \
	fi
	docker-compose build
	docker-compose up

loadtest:
	docker rm -f func-test || true
	@if [ ! -f ./.env ]; then\
  	read -p "Enter master seed:" master_seed; echo "MASTER_SEED=$$master_seed" >> ./.env; \
  	read -p "Enter master public key:" master_key; echo "MASTER_KEY=$$master_key" >> ./.env; \
  	read -p "Enter horizon host (with protocol and port [optional]):" horizon_host; echo "HORIZON_HOST=$$horizon_host" >> ./.env; \
  	read -p "Enter api host (with protocol and port [optional]):" api_host; echo "API_HOST=$$api_host" >> ./.env; \
  	read -p "Enter stellar network:" stellar_network; echo "STELLAR_NETWORK=$$stellar_network" >> ./.env; \
  	read -p "Enter asset:" asset; echo "ASSET=$$asset" >> ./.loadenv; \
  	read -p "How much transactions per minute initialize in load test (150 recommended):" tpm; echo "TPM=$$tpm" >> ./.env; \
	fi
	docker-compose build
	docker-compose up

attach:
	docker exec -i -t ${c} /bin/bash

purge:
	docker stop $(CONTAINERS)
	docker rm $(CONTAINERS)
	docker volume rm $(VOLUMES)