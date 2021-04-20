FROM node:9.0.0
RUN npm install --global gulp-cli 
WORKDIR /src/app
RUN npm install --save-dev gulp
COPY ./entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]