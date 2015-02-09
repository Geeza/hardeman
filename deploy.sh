#!/bin/sh

if [ -z "$1" ]
then
  echo "Which folder do you want to deploy to GitHub Pages?"
  exit 1
fi
gulp jade --env production
gulp sass --env production
git commit -a -m "Production release"
git push origin master
git subtree push --prefix $1 origin gh-pages