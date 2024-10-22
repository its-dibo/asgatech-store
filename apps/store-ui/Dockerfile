FROM node:lts

ENV dir=/apps/store-ui
ENV PORT=4200
ENV NODE_ENV=production

RUN mkdir -p $dir
COPY . .
RUN npm i -f --include=dev --fund=false
WORKDIR $dir
RUN npm run build

EXPOSE $PORT

CMD npm run serve

