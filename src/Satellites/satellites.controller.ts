import express, { Router } from 'express';
import Controller from '../common/controller';
import BaseRoutes from '../common/BaseRoutes';
import SatelliteService from './satellites.service';
import { RouteDoc } from '../common/RouteDoc';
import SatelliteModel from './satellites.model';
import { formatJsonString } from '../common/json';

class SatelliteController extends Controller {
  satService: SatelliteService;
  routeMap = new Map<string, RouteDoc>([
    ['getAll', { method: 'GET', path: `${this.path}` }],
    ['getById', { method: 'GET', path: `${this.path}/:id` }],
    ['getModel', { method: 'GET', path: `${this.path}/model` }],
    ['addOne', { method: 'POST', path: `${this.path}` }],
    ['patchOne', { method: 'PATCH', path: `${this.path}` }]
  ]);
  exampleModel: SatelliteModel = { name: 'Sat Name', lat: 1234, lon: 1234, id: 101010, status: 'Example Satus' };

  constructor(satService = new SatelliteService(), path = BaseRoutes.satellite) {
    super(path);
    this.satService = satService;
  }

  initializeRoutes(router: Router): void {
    router.get(this.routeMap.get('getModel').path, this.getModel);
    router.get(this.routeMap.get('getById').path, this.getSatById);
    router.get(this.routeMap.get('getAll').path, this.getAllSats);
    router.post(this.routeMap.get('addOne').path, this.addSat);
    router.patch(this.routeMap.get('patchOne').path, this.patchSat);
  }

  getAllSats = (_req: express.Request, res: express.Response) => {
    res.send(this.satService.getAll());
  };

  addSat = (req: express.Request, res: express.Response) => {
    const sat = req.body;
    if (!this.satService.canCreateSatellite(sat)) {
      res.status(400).json({ message: 'Invalid properties provided.' });
    }
    try {
      const newSat = this.satService.addOne({ ...sat, id: undefined });
      res.send(newSat);
    } catch {
      res.sendStatus(500);
    }
  };

  patchSat = (req: express.Request, res: express.Response) => {
    const sat = req.body;
    if (!this.satService.canPatchSatellite(sat)) {
      res.status(400).json({ message: 'Invalid properties provided.' });
    }
    try {
      const patchedSat = this.satService.patchOne(sat);
      res.send(patchedSat);
    } catch {
      res.sendStatus(500);
    }
  };

  getSatById = (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    if (!this.satService.isValidSatId(+id)) res.status(404).json({ message: 'Satellite not found.' });
    try {
      res.json(this.satService.getOne(+id));
    } catch {
      res.sendStatus(500);
    }
  };

  getModel = (_req: express.Request, res: express.Response) => {
    res.send(
      `<!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>TS Express Starter</title>
      </head>
      <body>
        <h1>SatModel Example:</h1>
        <h2>
        <pre>
        ${formatJsonString(JSON.stringify(this.exampleModel))}
        <pre>
        </h2>
      </body>
      </html>`
    );
  };
}

export default SatelliteController;
