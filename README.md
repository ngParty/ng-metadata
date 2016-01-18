# ng-metadata

[![Build Status](https://travis-ci.org/ngParty/ng-metadata.svg)](https://travis-ci.org/ngParty/ng-metadata)
[![Dependencies Status](https://david-dm.org/ngParty/ng-metadata.svg)](https://david-dm.org/ngParty/ng-metadata)
[![devDependency Status](https://david-dm.org/ngParty/ng-metadata/dev-status.svg)](https://david-dm.org/ngParty/ng-metadata#info=devDependencies)
[![npm](https://img.shields.io/npm/v/ng-metadata.svg)](https://www.npmjs.com/package/ng-metadata)
[![GitHub tag](https://img.shields.io/github/tag/ngParty/ng-metadata.svg)]()
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/ngParty/ng-metadata/master/LICENSE)

> Angular 2 style decorators for Angular 1.x

**ng-metadata** this is a viable solution for people,
who want to gradually update **existing** ng1 codebase to **Typescript** using Angular 2 conventions and styles that 
runs today on Angular 1.4+.

**TL;DR**

It leads you, to to write **clean and component driven** style code without complicated DDO definition API.

Behind the scenes it uses ES7 decorators extended by Typescript( which add to the proposal parameter decorators etc...)

![ng-metadata logo](assets/logo/ngMetadata.png)

## Installation

`npm i --save ng-metadata@beta`

You have to allow nodeJs module resolution style in your `tsconfig.json`

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "experimentalDecorators": true    
  }
}
```

That's it! Now just start importing from `ng-metadata/core` or `ng-metadata/platform`

> It is also recommended to install angular 1 type definitions, so you get Angular 1 API type checking,
 via [typings](https://github.com/typings/typings) or [tsd](https://github.com/Definitelytyped/tsd)

## Why

There is already an existing project, which gives us Angular 2 like syntax for Angular 1, [ng-forward](https://github.com/ngUpgraders/ng-forward)

With all do respect, ng-forward is an overkill IMHO, for existing ng1 apps, so this is why I made **ng-metadata**.

ng-metadata can be used as part of an upgrade strategy, which may also include *ng-upgrade*, when migrating to Angular 2.

## Learn

- Browse the [API Reference](docs/API.md)
- How to migrate es5 to typescript+ngMetadata [Design Patterns](docs/DESIGN-PATTERNS.md)
- explore the [TODO app](playground)
- check [FAQ](docs/FAQ.md) for more explanation why this exist

## Support

### Need Help?

Jump into the [ngParty Slack team](http://ngparty.slack.com) to join the discussion... if you aren't a member ping us
 on [twitter](http://twitter.com/ngPartyCz) and we will grant you access.

### Think You Found a Bug?

First check the [issues](https://github.com/ngParty/ng-metadata/issues) list to see if someone else has already 
found it and there's an ongoing discussion. If not, submit an [issue](https://github.com/ngParty/ng-metadata/issues).
 Thanks!

## Contributing to the Project

We want help! Please take a look at the [Contribution Guide](CONTRIBUTING.md) for guidelines and jump in the Slack 
team to discuss how you can help: http://ngparty.slack.com... if you aren't a member ping us on 
[twitter](https://twitter.com/ngPartyCz) and we will grant you access.
