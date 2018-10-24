#!/bin/bash -ex

if [ ! -e "$HOME/.meteor/meteor" ]; then
  curl https://install.meteor.com/ | sh
else
  echo "meteor already exists in Travis CI cache, not installing it."
fi

# Making sure correct version of meteor is downloaded
meteor --release 1.8 --version
