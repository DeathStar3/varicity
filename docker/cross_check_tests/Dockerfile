FROM node:14.14-alpine

RUN mkdir -p /opt/karma

WORKDIR /opt/karma


RUN apk update && apk upgrade && apk add --no-cache chromium

COPY varicity/public /opt/karma/public
COPY varicity/src /opt/karma/src
COPY varicity/tsconfig.json /opt/karma/

COPY docker/cross_check_tests/configs /opt/karma/config
COPY docker/cross_check_tests/files /opt/karma/

COPY d3/scripts/ /opt/karma/scripts

COPY generated_visualizations/data /opt/karma/symfinder_files

RUN npm install --save-dev jasmine-core karma-jasmine karma-jquery

RUN npm install && npm run-script build

CMD npm run test -- --contextFile=$CONTEXT_FILE --testsDir=$TESTS_DIR
