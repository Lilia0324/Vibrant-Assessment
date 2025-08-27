const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateSample = [
  // sampleId validation with regex
  body('sampleId')
    .matches(/^[A-Z]-\d{3,5}$/)
    .withMessage('Invalid Sample ID format. Must be like A-123.'),

  // collectionDate validation
  body('collectionDate')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const collectionDate = new Date(value);
      if (collectionDate > today) {
        throw new Error('Collection date cannot be in the future');
      }
      return true;
    }),

  // sampleType validation
  body('sampleType')
    .isIn(['blood', 'saliva', 'tissue'])
    .withMessage('Invalid sample type selected'),

  // priority validation
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority selected'),
];

router.post('/samples', validateSample, (req, res) => {
  const errors = validationResult(req);

  // If there are validation errors, return a 400 response with detailed errors
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach(err => {
      // Map the express-validator error format to the desired field-level format
      formattedErrors[err.path] = { message: err.msg };
    });

    return res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors
    });
  }

  // If validation passes, process the request
  const { sampleId, collectionDate, sampleType, priority } = req.body;
  
  console.log('Received valid sample:', {
    sampleId,
    collectionDate,
    sampleType,
    priority,
  });

  // Example of a successful response
  return res.status(201).json({
    message: 'Sample created successfully',
    data: req.body,
  });
});

module.exports = router;