
const db = require('../model/index.js');
const lg = require('../logger.js');
const stat = require('../statsd.js');

const checkAll = async (req, res) => {
    const health = await db.dbConnectionCheck();
    stat.increment('healthcheck.count');

    if (req.method != 'GET') {
        lg.warn('Received an HTTP method that is not allowed');
        res.status(405).send('Method Not Allowed');
    }else{
        if (req.originalUrl != '/v1/healthz') {
            lg.error('Received a request for an unknown URL');
            res.status(404).send('Not Found');
        }else{

            if(health.status==200){
                lg.info('Health check passed');
                res.status(200).send('OK');
            }else{
                if(health.status==503){
                    lg.warn('Service is unavailable');
                    res.status(503).send('Service Unavailable')
                }else{
                    lg.error('Bad request');
                    res.status(400).send('Bad request')
                } 
            }
           }   
        }
    
}


module.exports = {
    checkAll

}