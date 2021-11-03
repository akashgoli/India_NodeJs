#!/bin/bash
set -e
set -o
sudo chown -R ec2-user:ec2-user /home/ec2-user/Share-e-care-Nodejs/
cd /home/ec2-user/Share-e-care-Nodejs/
npm i
