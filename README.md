# RollupNC co-ordinator

Acts as a co-ordinator between users for RollupNC

## Install

> Please ensure you have `rabbitmq-server` running in background

```bash
npm i
```
## Setup coordinator prvkey and DB password
```bash
npm run setup
```
NB: you can manually change the secrets in `config.json` instead of running `npm run setup`.

## Create Migration 
```bash
knex migrate:make account_tree  --knexfile=DB/knexfile.js
```
## Run Migrations

```bash
npm run migrations
```

> Note mysql needs to be installed

## Reset DB and Rerun Migrations

```bash
npm run redo
```

## Alter genesis balance state

To alter the genesis state, change config/genesis.json

## Run

> Please set configration as per requirement in config/config.json

```bash
npm run coordinator
```

## Send test transactions

```bash
bash sendTestRequests.sh
```

## Send test transaction

```bash
curl -X POST \
  http://localhost:3000/submitTx \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 6a5d7f6b-2189-4b7b-81c8-dd62067217a4' \
  -H 'cache-control: no-cache' \
  -d '{
	"fromX":"5686635804472582232015924858874568287077998278299757444567424097636989354076",
	"fromY":"20652491795398389193695348132128927424105970377868038232787590371122242422611",
	"toX":"5188413625993601883297433934250988745151922355819390722918528461123462745458",
	"toY":"12688531930957923993246507021135702202363596171614725698211865710242486568828",
	"amount":"500",
	"tokenType":"10",
	"signature":{
        "R8": "16983338799297102739311784762032344870039222281986241143318530383875079624912,17974713114491039907234265242193070110554943394288196512948620624137364193552",
        "S": "1343828434385488942743107335063404632386867645513272609057729341930827645964"
    }
}'
```
