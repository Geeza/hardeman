#!/bin/sh

gulp jade --env production
gulp sass --env production
git commit -a -m "Production release"
git push origin master
git subtree push --prefix ./dist origin gh-pages