#!/bin/bash
cd /home/ec2-user/Share-e-care-Nodejs/
# todo: need to remove this in upcoming tags.
sudo pm2 kill
pm2 kill
rm -rf /home/ec2-user/Share-e-care-Nodejs/
mkdir -p /home/ec2-user/Share-e-care-Nodejs
