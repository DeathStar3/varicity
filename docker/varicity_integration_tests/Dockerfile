FROM node:14.14-alpine

RUN mkdir -p /opt/karma

WORKDIR /opt/karma

COPY varicity/package.json /opt/karma/
COPY docker/varicity_integration_tests/configs /opt/karma/config
COPY varicity/public /opt/karma/public
COPY varicity/src /opt/karma/src
COPY varicity/tsconfig.json /opt/karma/

COPY docker/varicity_integration_tests/files /opt/karma/

COPY generated_visualizations/data /opt/karma/symfinder_files

RUN npm install

CMD npm run test