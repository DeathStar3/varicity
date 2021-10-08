FROM node:14.14-alpine

RUN mkdir -p /opt/karma

WORKDIR /opt/karma

COPY varicity/. /opt/karma/

RUN npm install

CMD npm run test