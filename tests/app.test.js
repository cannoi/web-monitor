const test = require('node:test');
const assert = require('node:assert/strict');
process.env.DB_PATH = '/tmp/web-monitor-test-' + process.pid + '.db';
const { app, db } = require('../server');
const http = require('node:http');
let server;
test.before(() => new Promise(resolve => { server = app.listen(Number(process.env.PORT || 8080), '127.0.0.1', resolve); }));
test.after(() => new Promise(resolve => server.close(resolve)));
function request(method, path, body) { return new Promise((resolve, reject) => { const req = http.request({ hostname:'127.0.0.1', port: server.address().port, path, method, headers:{'Content-Type':'application/json'} }, res => { let data=''; res.on('data',x=>data+=x); res.on('end',()=>resolve({status:res.statusCode,body:data?JSON.parse(data):null})); }); req.on('error',reject); if(body)req.end(JSON.stringify(body)); else req.end(); }); }
test('health is ready', async()=>{const r=await request('GET','/health');assert.equal(r.status,200);assert.equal(r.body.ok,true)});
test('monitor CRUD', async()=>{const created=await request('POST','/api/monitors',{name:'Example',url:'https://example.com',interval:15});assert.equal(created.status,201);assert.equal(created.body.name,'Example');const id=created.body.id;assert.equal((await request('GET','/api/monitors')).status,200);assert.equal((await request('PUT','/api/monitors/'+id,{name:'Updated',url:'https://example.org',interval:30})).status,200);assert.equal((await request('POST','/api/monitors/'+id+'/check',{})).status,200);assert.equal((await request('DELETE','/api/monitors/'+id)).status,204);});
