#!/bin/bash

echo "Installing npm components"
npm install

if [ -z "$TPM" ]; then
    echo "Start functional test..."
    node functest.js
else
    echo "Start load test ($TPM transactions per minute)"
    node loadtest.js
fi