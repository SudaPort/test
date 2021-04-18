FROM node:7.2
RUN npm install --global gulp-cli
WORKDIR /src/app

COPY ./entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]