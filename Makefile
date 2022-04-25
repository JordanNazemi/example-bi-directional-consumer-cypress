PACTICIPANT := "pactflow-example-bi-directional-consumer-cypress"
PACT_CLI="docker run --rm -v ${PWD}:${PWD} -e PACT_BROKER_BASE_URL -e PACT_BROKER_TOKEN pactfoundation/pact-cli"
GIT_COMMIT:= $(shell git rev-parse HEAD)
GIT_BRANCH:= $(shell git rev-parse --abbrev-ref HEAD)

ifeq ($(GIT_BRANCH), master)
	DEPLOY_TARGET=deploy
	DEPLOY_ENV=production
else ifeq ($(GIT_BRANCH), dev)
	DEPLOY_TARGET=deploy
	DEPLOY_ENV=development
else
	DEPLOY_ENV=development
	DEPLOY_TARGET=no_deploy
endif

all: test

## ====================
## CI tasks
## ====================

ci: test publish_pacts can_i_deploy $(DEPLOY_TARGET)

# Run the ci target from a developer machine with the environment variables
# set as if it was on CI.
# Use this for quick feedback when playing around with your workflows.
fake_ci: .env
	@CI=true \
	REACT_APP_API_BASE_URL=http://localhost:3001 \
	make ci

publish_pacts: .env
	@echo "\n========== STAGE: publish cypress pacts ==========\n"
	@echo "${GIT COMMIT}"
	@"${PACT_CLI}" publish ${PWD}/cypress/pacts --consumer-app-version ${GIT_COMMIT} --branch ${GIT_BRANCH}

deploy_target: $(DEPLOY_TARGET)

## =====================
## Build/test tasks
## =====================

test: .env
	@echo "\n========== STAGE: test (cypress) ==========\n"
	npm run start:ui:and:test

## =====================
## Deploy tasks
## =====================
deploy: deploy_app record_deployment

no_deploy:
	@echo "Not deploying as not on master or dev branch"

can_i_deploy: .env
	@echo "\n========== STAGE: can-i-deploy? ==========\n"
	@"${PACT_CLI}" broker can-i-deploy \
	  --pacticipant ${PACTICIPANT} \
	  --version ${GIT_COMMIT} \
	  --to-environment ${DEPLOY_ENV} \
	  --retry-while-unknown 0 \
	  --retry-interval 10

deploy_app:
	@echo "\n========== STAGE: deploy ==========\n"
	@echo "Deploying to production"

record_deployment: .env
	@"${PACT_CLI}" broker record-deployment --pacticipant ${PACTICIPANT} --version ${GIT_COMMIT} --environment ${DEPLOY_ENV}


## ======================
## Misc
## ======================

.env:
	touch .env

output:
	mkdir -p ./pacts
	touch ./pacts/tmp

clean: output
	rm pacts/*
