The `phTxt` directive dynamically inserts "Lorem ipsum"-style text
into an element. It can work as either an element or an attribute. 

`phTxt` accepts a single value that can express the number of desired paragraphs
and/or sentences. The format is `#p#s`, where the numbers represent the number
of requested paragraphs and sentences, respectively. Order is irrelevant.

If both are provided, the element will contain the requested number of
paragraphs, each with the requested number of sentences.

If just the number of paragraphs is provided, the number of sentences will be
random for each paragraph. If just the number of sentences is provided, no
paragraphs will be generated - just the specified number of sentences.

If neither are provided, the default behavior is a random number of paragraphs,
each with a random number of sentences.
