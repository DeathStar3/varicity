FROM node:14.14-alpine

RUN mkdir -p /opt/karma

WORKDIR /opt/karma

COPY varicity/ /opt/karma/

COPY docker/varicity_integration_tests/configs /opt/karma/config
COPY docker/varicity_integration_tests/files /opt/karma/

COPY generated_visualizations/data /opt/karma/symfinder_files

RUN npm install

CMD npm run test