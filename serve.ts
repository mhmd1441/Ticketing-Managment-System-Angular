// import apimock from '@ng-apimock/core';
// import express from 'express';


// const devInterface = require('@ng-apimock/dev-interface');

// const app = express();
// const PORT = 9000;

// apimock.processor.process({ src: 'mocks' });

// app.use(apimock.middleware);
// app.use('/dev-interface', express.static(devInterface));

// app.listen(PORT, () => {
//   console.log(`@ng-apimock/core running on http://localhost:${PORT}`);
//   console.log(`dev-interface available at http://localhost:${PORT}/dev-interface/`);
// });



import apimock from '@ng-apimock/core';
import express from 'express';

const devInterface = require('@ng-apimock/dev-interface');

const app = express();
const PORT = 9000;
const HOST = '0.0.0.0'; // <-- Forces binding to all network interfaces (IPv4 & IPv6)

apimock.processor.process({ src: 'mocks' });

app.use(apimock.middleware);
app.use('/dev-interface', express.static(devInterface));

app.listen(PORT, HOST, () => {
  console.log(`@ng-apimock/core running on http://127.0.0.1:${PORT}`);
  console.log(`dev-interface available at http://127.0.0.1:${PORT}/dev-interface/`);
});