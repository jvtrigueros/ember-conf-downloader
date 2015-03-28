# ember-conf-downloader
>Download EmberConf videos for offline viewing.

EmberConf just passed a few weeks back and I wanted to have the talks available for viewing when I'm offline for those
times where WiFi is not allowed (e.g. plane).

I created this small tool that you can use to download any of the EmberConf videos! This is thanks to 
[poteto](https://github.com/poteto) for creating an [EmberConf Summary](https://github.com/poteto/emberconf-2015).

## Install

    npm install -g emberconf-cli

## Usage

```
Usage: emberconf <command>

command
  list     Lists available EmberConf videos.
  get      Download an EmberConf video by giving an index obtained from using the 'list' command
```