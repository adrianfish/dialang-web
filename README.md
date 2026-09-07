# Dialang

## Background

Dialang is an online diagnostic system designed to assess a person's proficiency in 14 European
languages. Competences tested are reading, writing, listening, grammar and vocabulary, while
speaking is excluded for technical reasons.

Dialang was designed primarily for European citizens to assess their language abilities in adherence
to Europe's Common European Framework of Reference – CEFR – as a basis for determining language
proficiency. The CEFR is a widely recognized framework used to describe and measure the language
proficiency level of a learner in a particular language.

Dialang was funded by the SOCRATES programme and by some 25 institutions, largely universities,
throughout the European Union. Dialang is explained in the Appendix C, pages 226-243 of the CEFR
official document.

This repo contains the delivery code for the Dialang online language ability diagnostic system. The
code is written in TypeScript and designed to run in an edge optimised runtime such as Deno Deploy
or Cloudflare.

## Data

The code is only one part of the Dialang system, however. You also need to publish the data and
content fragments which are pulled dynamically by the Dialang frontend code. Dialang just won't work
without that data and the data currently isn't publicly available.

## Running it locally

You can run Dialang locally by installing the Deno runtime and just running the start task. This
will start Dialang up under a local port, ideal for testing.

```shell
deno task start
```

## Deploying to Deno Deploy

Dlalang is deployed directly from https://github.com/adrianfish/dialang-web. As soon as PRs are
merged, Deno Deploy will redeploy the updated code.
