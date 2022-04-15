Prism.languages.motoko = {
  typeb: /\<\w[^\>]*?\>/,
  typex: /\#\w+/,

  varn: /(?:var|let)\s+([^=\:]+)/,
  typen: /(?:type)\s+([^=\:]+)/,
  objn: /[^\s\()]+\./,
  fnn: /\.[^\s]+/,
  typea: /\[[^\]]*?\]/,
  typet: /\w+\s*\:/,

  comment: [
    {
      pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
      lookbehind: true,
      greedy: true,
    },
    {
      pattern: /(^|[^\\:])\/\/.*/,
      lookbehind: true,
      greedy: true,
    },
  ],
  string: {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true,
  },
  function: {
    pattern: /func\s+([^\s]*)\(.*?\)(?:\s+:)/,
    greedy: true,
    inside: {
      params: {
        pattern: /\(.+?\)/,
      },
    },
  },
  "class-name": {
    pattern:
      /(\b(?:class|module|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
    lookbehind: true,
    inside: {
      punctuation: /[.\\]/,
    },
  },
  keyword:
    /\b(?:break|catch|public|func|assert|type|private|let|var|async|await|shared|query|actor|case|switch|module|continue|and|or|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
  boolean: /\b(?:false|true)\b/,
  number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
  operator: /(?:==|:=|=|\+=|\-=|%|\<=|\>=|\>|\<|-\>)/,
  punctuation: /[{}[\];(),.:\?]/,
};

Prism.languages.mo = Prism.languages.motoko;
