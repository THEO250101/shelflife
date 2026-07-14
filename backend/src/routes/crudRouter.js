import express from 'express';
import { collection, serializeDoc, toObjectId } from '../db/mongo.js';

function pickAllowed(body, allowedFields) {
  return allowedFields.reduce((doc, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      doc[field] = body[field];
    }
    return doc;
  }, {});
}

function addFilter(query, field, value) {
  if (value !== undefined && value !== '') {
    query[field] = value === 'true' ? true : value === 'false' ? false : value;
  }
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function requestedLimit(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 80;
  }
  return Math.min(Math.max(parsed, 20), 200);
}

export function createCrudRouter({
  collectionName,
  allowedFields,
  filters = [],
  sort = { createdAt: -1 },
  validate = (doc) => doc,
}) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const query = { userId: req.user._id };
      filters.forEach((field) => addFilter(query, field, req.query[field]));

      if (req.query.q) {
        const search = String(req.query.q).trim().slice(0, 80);
        const regex = new RegExp(escapeRegex(search), 'i');
        query.$or = [{ name: regex }, { title: regex }, { notes: regex }, { category: regex }];
      }

      const limit = requestedLimit(req.query.limit);
      const [docs, total] = await Promise.all([
        collection(collectionName).find(query).sort(sort).limit(limit).toArray(),
        collection(collectionName).countDocuments(query),
      ]);
      res.json({ items: docs.map(serializeDoc), total, limit });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const doc = await collection(collectionName).findOne({
        _id: toObjectId(req.params.id),
        userId: req.user._id,
      });
      if (!doc) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.json({ item: serializeDoc(doc) });
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const payload = validate(pickAllowed(req.body, allowedFields), { partial: false });
      const doc = {
        ...payload,
        userId: req.user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await collection(collectionName).insertOne(doc);
      res.status(201).json({ item: serializeDoc({ ...doc, _id: result.insertedId }) });
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const payload = validate(pickAllowed(req.body, allowedFields), { partial: true });
      const updates = {
        ...payload,
        updatedAt: new Date(),
      };
      const result = await collection(collectionName).findOneAndUpdate(
        { _id: toObjectId(req.params.id), userId: req.user._id },
        { $set: updates },
        { returnDocument: 'after' }
      );
      if (!result) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.json({ item: serializeDoc(result) });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const result = await collection(collectionName).deleteOne({
        _id: toObjectId(req.params.id),
        userId: req.user._id,
      });
      if (result.deletedCount === 0) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
