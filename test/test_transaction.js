import request from 'supertest';
import app from '../src/app'

describe('Relayer API', () => {
    // var server

    // beforeEach(function () {
    //     const makeServer = require("../src/server.js");
    //     server = makeServer()
    // });

    // afterEach(function (done) {
    //     server.close(done);
    // });

    describe('GET /submitTx', () => {
        it('should accept', (done) => {
            request(app)
                .post('/submitTx')
                .send(
                    {
                        fromX: "5686635804472582232015924858874568287077998278299757444567424097636989354076",
                        fromY: "20652491795398389193695348132128927424105970377868038232787590371122242422611",
                        toX: "5188413625993601883297433934250988745151922355819390722918528461123462745458",
                        toY: "12688531930957923993246507021135702202363596171614725698211865710242486568828",
                        amount: "500",
                        tokenType: "0",
                        signature: {
                            R8: "17807195043340221451227917273497453514728936442288299739142508164408249487812,5331411049013893192010726501745166557871818960275683186559775268611257822909",
                            S: "2439546511362325609486661239127440581949309152515824497404040445288798624425"
                        }
                    }
                )
                .expect(200)
                .end(function(err, res) {
                    if (err) done(err);
                    else done()
                  });
        })
    })
})