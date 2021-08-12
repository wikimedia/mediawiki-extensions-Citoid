/**
 * Citoid extension unit tests for function
 * ve.ui.CitoidInspector.populateTemplate
 */

QUnit.module( 'ext.citoid' );

/* Functions */

( function () {

	/**
	 * Creates a template given a templateData map and citation,
	 * and compares it to the expected output.
	 *
	 * @param {Object} maps templateData maps value
	 * @param {Object} citation Citation in citoid mediawiki output format
	 * @param {Object} expected Expected serialized template
	 * @param {Function} assert QUnit assert function
	 * @return {Object} a Promise for the transclusion with added template
	 */
	function testMaps( maps, citation, expected, assert ) {
		var data = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {},
				i: 0
			},
			transclusion = new ve.dm.MWTransclusionModel(),
			template = ve.dm.MWTemplateModel.newFromData( transclusion, data ),
			templateData = {
				title: 'Template:Cite web',
				description: 'Formats a citation to a website using the provided information such as URL and title. Used only for sources that are not correctly described by the specific citation templates for books, journals, news sources, etc.',
				params: {
					url: {
						label: 'URL',
						description: 'The URL of the online location where the text of the publication can be found',
						type: 'string',
						required: true,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					title: {
						label: 'Source title',
						description: 'The title of the source page on the website; will display with quotation marks added',
						type: 'string',
						required: true,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					date: {
						label: 'Source date',
						description: 'Full date when the source was published; if unknown, use accessdate instead; do not wikilink',
						type: 'string',
						suggested: true,
						required: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					accessdate: {
						label: 'URL access date',
						description: 'The full date when the original URL was accessed; do not wikilink',
						type: 'string',
						suggested: true,
						required: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					website: {
						label: 'Website title',
						description: 'Title of the website; may be wikilinked; will display in italics',
						type: 'string',
						aliases: [
							'work'
						],
						suggested: true,
						required: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					publisher: {
						label: 'Publisher',
						description: 'Name of the publisher; may be wikilinked',
						type: 'string',
						suggested: true,
						required: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					last: {
						label: 'Last name',
						description: 'The surname of the author; don\'t wikilink, use \'authorlink\'; can suffix with a numeral to add additional authors',
						type: 'line',
						aliases: [
							'last1',
							'author',
							'author1',
							'authors'
						],
						suggested: true,
						required: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					first: {
						label: 'First name',
						description: 'Given or first name, middle names, or initials of the author; don\'t wikilink, use \'authorlink\'; can suffix with a numeral to add additional authors',
						type: 'line',
						aliases: [
							'first1'
						],
						suggested: true,
						required: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					authorlink: {
						label: 'Author link',
						description: 'Title of existing Wikipedia article about the author; can suffix with a numeral to add additional authors',
						type: 'wiki-page-name',
						aliases: [
							'authorlink1',
							'author-link',
							'author1-link'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					last2: {
						label: 'Last name',
						description: 'The surname of the second author; don\'t wikilink, use \'authorlink2\'.',
						type: 'line',
						aliases: [
							'author2'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					first2: {
						label: 'First name',
						description: 'Given or first name, middle names, or initials of the second author; don\'t wikilink.',
						type: 'line',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					authorlink2: {
						label: 'Author link',
						description: 'Title of existing Wikipedia article about the second author.',
						type: 'wiki-page-name',
						aliases: [
							'author2-link'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					others: {
						label: 'Others',
						description: 'Used to record other (non-author) contributions to the work, such as \'Illustrated by John Smith\' or \'Translated by John Smith\'',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					month: {
						label: 'Month of publication',
						description: 'Name of the month of publication; do not wikilink; use \'date\' instead, if day of month is also known',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					year: {
						label: 'Year of publication',
						description: 'Year of the source being referenced; use \'date\' instead, if month and day are also known',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					origyear: {
						label: 'Original year',
						description: 'Original year of publication; provide specifics',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					'editor-last': {
						label: 'Editor last name',
						description: 'The surname of the editor; don\'t wikilink, use \'editor-link\'; can suffix with a numeral to add additional editors; alias of \'editor1-last\', \'editor\', and \'editors\'',
						type: 'line',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					'editor-first': {
						label: 'Editor first name',
						description: 'Given or first name, middle names, or initials of the editor; don\'t wikilink, use \'editor-link\'; can suffix with a numeral to add additional editors; alias of \'editor1-first\'',
						type: 'line',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					'editor-link': {
						label: 'Editor link',
						description: 'Title of existing Wikipedia article about the editor; can suffix with a numeral to add additional editors',
						aliases: [
							'editor1-link'
						],
						type: 'wiki-page-name',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					series: {
						label: 'Series identifier',
						description: 'Series identifier when the source is part of a series, such as a book series or a journal',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					location: {
						label: 'Location of publication',
						description: 'Geographical place of publication; usually not wikilinked; omit when the publication name includes place; alias of \'place\'',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					'publication-place': {
						label: 'Place of publication',
						description: 'Publication place shows after title; if \'place\' or \'location\' are also given, they are displayed before the title prefixed with \'written at\'',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					'publication-date': {
						label: 'Publication date',
						description: 'Date of publication when different from the date the work was written; do not wikilink',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					page: {
						label: 'Page',
						description: 'Page in the source that supports the content; displays after \'p.\'',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					pages: {
						label: 'Pages',
						description: 'Pages in the source that support the content (not an indication of the number of pages in the source; displays after \'pp.\'',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					nopp: {
						label: 'No pp',
						description: 'Set to \'y\' to suppress the \'p.\' or \'pp.\' display with \'page\' or \'pages\' when inappropriate (such as \'Front cover\')',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					at: {
						label: 'At',
						description: 'May be used instead of \'page\' or \'pages\' where a page number is inappropriate or insufficient',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					language: {
						label: 'Language',
						description: 'The language in which the source is written, if not English; use the full language name; do not use icons or templates',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					'trans-title': { // Original field was trans_title - renamed here
						label: 'Translated title',
						description: 'An English language title, if the source cited is in a foreign language; \'language\' is recommended',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					type: {
						label: 'Type',
						description: 'Additional information about the media type of the source; format in sentence case',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					format: {
						label: 'Format',
						description: 'Format of the work referred to by \'url\'; examples: PDF, DOC, XLS; do not specify HTML',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					arxiv: {
						label: 'arXiv identifier',
						description: 'An identifier for arXive electronic preprints of scientific papers',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					asin: {
						label: 'AZIN',
						description: 'Amazon Standard Identification Number; 10 characters',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					'asin-tld': {
						label: 'AZIN TLD',
						description: 'ASIN top-level domain for Amazon sites other than the US',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					bibcode: {
						label: 'Bibcode',
						description: 'Bibliographic Reference Code (REFCODE); 19 characters',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					doi: {
						label: 'DOI',
						description: 'Digital Object Identifier; begins with \'10.\'',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					'doi-brokendate': { // Original field was doi_brokendate - renamed
						label: 'DOI broken date',
						description: 'The date that the DOI was determined to be broken',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					isbn: {
						label: 'ISBN',
						description: 'International Standard Book Number; use the 13-digit ISBN where possible',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					issn: {
						label: 'ISSN',
						description: 'International Standard Serial Number; 8 characters; may be split into two groups of four using a hyphen',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					jfm: {
						label: 'jfm code',
						description: 'Jahrbuch über die Fortschritte der Mathematik classification code',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					jstor: {
						label: 'JSTOR',
						description: 'JSTOR identifier',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					lccn: {
						label: 'LCCN',
						description: 'Library of Congress Control Number',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					mr: {
						label: 'MR',
						description: 'Mathematical Reviews identifier',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					oclc: {
						label: 'OCLC',
						description: 'Online Computer Library Center number',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					ol: {
						label: 'OL',
						description: 'Open Library identifier',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					osti: {
						label: 'OSTI',
						description: 'Office of Scientific and Technical Information identifier',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					pmc: {
						label: 'PMC',
						description: 'PubMed Center article number',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					pmid: {
						label: 'PMID',
						description: 'PubMed Unique Identifier',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					rfc: {
						label: 'RFC',
						description: 'Request for Comments number',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					ssrn: {
						label: 'SSRN',
						description: 'Social Science Research Network',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					zbl: {
						label: 'Zbl',
						description: 'Zentralblatt MATH journal identifier',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					id: {
						label: 'id',
						description: 'A unique identifier used where none of the specialized ones are applicable',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					archiveurl: {
						label: 'Archive URL',
						description: 'The URL of an archived copy of a web page, if or in case the URL becomes unavailable; requires \'archivedate\'',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					archivedate: {
						label: 'Archive date',
						description: 'Date when the original URL was archived; do not wikilink',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					deadurl: {
						label: 'Dead URL',
						description: 'If set to \'no\', the title display is adjusted; useful for when the URL is archived preemptively but still live',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					quote: {
						label: 'Quote',
						description: 'Relevant text quoted from the source; displays last, enclosed in quotes; needs to include terminating punctuation',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					ref: {
						label: 'Ref',
						description: 'An anchor identifier; can be made the target of wikilinks to full references; special value \'harv\' generates an anchor suitable for the harv template',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					separator: {
						label: 'Separator',
						description: 'The punctuation used to separate lists of authors, editors, etc.; a space must be encoded as &#32; do not use an asterisk, colon, or hash mark',
						type: 'string',
						default: '.',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null
					},
					postscript: {
						label: 'Postscript',
						description: 'The closing punctuation for the citation; ignored if \'quote\' is defined',
						type: 'string',
						default: '.',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null
					},
					layurl: {
						label: 'Lay URL',
						description: 'URL link to a non-technical summary or review of the source; alias of \'laysummary\'',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					laysource: {
						label: 'Lay source',
						description: 'Name of the source of the laysummary; displays in italics, preceded by an en dash',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					laydate: {
						label: 'Lay date',
						description: 'Date of the summary; displays in parentheses',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					'author-mask': {
						label: 'Author mask',
						description: 'Replaces the name of the first author with em dashes or text; set to a numeric value \'n\' to set the dash \'n\' em spaces wide; set to a text value to display the text without a trailing author separator; for example, \'with\' instead',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					last3: {
						label: 'Last name',
						description: 'The surname of the third author; don\'t wikilink, use \'authorlink3\'.',
						type: 'line',
						aliases: [
							'author3'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					first3: {
						label: 'First name',
						description: 'Given or first name, middle names, or initials of the third author; don\'t wikilink.',
						type: 'line',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					authorlink3: {
						label: 'Author link',
						description: 'Title of existing Wikipedia article about the third author.',
						type: 'wiki-page-name',
						aliases: [
							'author3-link'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					last4: {
						label: 'Last name',
						description: 'The surname of the fourth author; don\'t wikilink, use \'authorlink4\'.',
						type: 'line',
						aliases: [
							'author4'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					first4: {
						label: 'First name',
						description: 'Given or first name, middle names, or initials of the fourth author; don\'t wikilink.',
						type: 'line',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					authorlink4: {
						label: 'Author link',
						description: 'Title of existing Wikipedia article about the fourth author.',
						type: 'wiki-page-name',
						aliases: [
							'author4-link'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					last5: {
						label: 'Last name',
						description: 'The surname of the fifth author; don\'t wikilink, use \'authorlink5\'.',
						type: 'line',
						aliases: [
							'author5'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					first5: {
						label: 'First name',
						description: 'Given or first name, middle names, or initials of the fifth author; don\'t wikilink.',
						type: 'line',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					authorlink5: {
						label: 'Author link',
						description: 'Title of existing Wikipedia article about the sixth author.',
						type: 'wiki-page-name',
						aliases: [
							'author5-link'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					last6: {
						label: 'Last name',
						description: 'The surname of the sixth author; don\'t wikilink, use \'authorlink6\'.',
						type: 'line',
						aliases: [
							'author6'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					first6: {
						label: 'First name',
						description: 'Given or first name, middle names, or initials of the sixth author; don\'t wikilink.',
						type: 'line',
						aliases: [
							'author6-link'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					authorlink6: {
						label: 'Author link',
						description: 'Title of existing Wikipedia article about the sixth author.',
						type: 'wiki-page-name',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					last7: {
						label: 'Last name',
						description: 'The surname of the seventh author; don\'t wikilink, use \'authorlink7\'.',
						type: 'line',
						aliases: [
							'author7'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					first7: {
						label: 'First name',
						description: 'Given or first name, middle names, or initials of the seventh author; don\'t wikilink.',
						type: 'line',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					authorlink7: {
						label: 'Author link',
						description: 'Title of existing Wikipedia article about the seventh author.',
						type: 'wiki-page-name',
						aliases: [
							'author7-link'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					last8: {
						label: 'Last name',
						description: 'The surname of the eighth author; don\'t wikilink, use \'authorlink8\'.',
						type: 'line',
						aliases: [
							'author8'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					first8: {
						label: 'First name',
						description: 'Given or first name, middle names, or initials of the eighth author; don\'t wikilink.',
						type: 'line',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					authorlink8: {
						label: 'Author link',
						description: 'Title of existing Wikipedia article about the eighth author.',
						type: 'wiki-page-name',
						aliases: [
							'author8-link'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					last9: {
						label: 'Last name',
						description: 'The surname of the ninth author; don\'t wikilink, use \'authorlink9\'. If nine authors are defined, then only eight will show and \'et al.\' will show in place of the last author.',
						type: 'line',
						aliases: [
							'author9'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					first9: {
						label: 'First name',
						description: 'Given or first name, middle names, or initials of the ninth author; don\'t wikilink.',
						type: 'line',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					authorlink9: {
						label: 'Author link',
						description: 'Title of existing Wikipedia article about the ninth author.',
						type: 'wiki-page-name',
						aliases: [
							'author9-link'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null,
						default: null
					},
					'author-name-separator': {
						label: 'Author name separator',
						description: 'Changes the separator between last and first names; defaults to a comma and space; a space must be encoded as &#32; do not use an asterisk, colon, or hash mark',
						type: 'string',
						default: ', ',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null
					},
					'author-separator': {
						label: 'Author separator',
						description: 'Changes the separator between authors; defaults to a semicolon and space; a space must be encoded as &#32; do not use an asterisk, colon, or hash mark',
						type: 'string',
						default: '; ',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null
					},
					'display-authors': {
						label: 'Display authors',
						description: 'Number of authors to display before \'et al.\' is used; default is to do so after 8 of 9 are listed.',
						type: 'number',
						default: '8',
						aliases: [
							'displayauthors'
						],
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						autovalue: null
					},
					lastauthoramp: {
						label: 'Last author ampersand',
						description: 'When set to any value, changes the separator between the last two names of the author list to \'space ampersand space\'',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					subscription: {
						label: 'Subscription required',
						description: 'When set to yes, displays “(subscription required)” to indicate an online source that requires subscription',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					registration: {
						label: 'Registration required',
						description: 'When set to yes, displays “(registration required)” to indicate an online source that requires registration',
						type: 'string',
						required: false,
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					},
					edition: {
						label: 'Edition',
						type: 'string',
						required: false,
						description: 'Specify the edition or revision of the source, when applicable. For example: \'2nd\' or \'5.1\'. What you supply here is suffixed by \' ed.\'',
						suggested: false,
						example: null,
						deprecated: false,
						aliases: [

						],
						autovalue: null,
						default: null
					}
				},
				sets: [ {
					label: 'SomeIDs',
					params: [
						'id',
						'rfc'
					]
				} ],
				paramOrder: [
					'url',
					'title',
					'date',
					'accessdate',
					'website',
					'publisher',
					'last',
					'first',
					'authorlink',
					'last2',
					'first2',
					'authorlink2',
					'others',
					'month',
					'year',
					'origyear',
					'editor-last',
					'editor-first',
					'editor-link',
					'series',
					'location',
					'publication-place',
					'publication-date',
					'page',
					'pages',
					'nopp',
					'at',
					'language',
					'trans-title',
					'type',
					'format',
					'arxiv',
					'asin',
					'asin-tld',
					'bibcode',
					'doi',
					'doi-brokendate',
					'isbn',
					'issn',
					'jfm',
					'jstor',
					'lccn',
					'mr',
					'oclc',
					'ol',
					'osti',
					'pmc',
					'pmid',
					'rfc',
					'ssrn',
					'zbl',
					'id',
					'archiveurl',
					'archivedate',
					'deadurl',
					'quote',
					'ref',
					'separator',
					'postscript',
					'layurl',
					'laysource',
					'laydate',
					'author-mask',
					'last3',
					'first3',
					'authorlink3',
					'last4',
					'first4',
					'authorlink4',
					'last5',
					'first5',
					'authorlink5',
					'last6',
					'first6',
					'authorlink6',
					'last7',
					'first7',
					'authorlink7',
					'last8',
					'first8',
					'authorlink8',
					'last9',
					'first9',
					'authorlink9',
					'author-name-separator',
					'author-separator',
					'display-authors',
					'lastauthoramp',
					'subscription',
					'registration',
					'edition'
				]
			};

		// Set maps for this test
		templateData.maps = maps;

		// TODO: Temporary compatibility hack. Remove when not needed any more.
		if ( !transclusion.cacheTemplateDataApiResponse ) {
			transclusion.cacheTemplateDataApiResponse = transclusion.fetchRequestDone;
		}
		transclusion.cacheTemplateDataApiResponse( { pages: { 0: templateData } } );

		// Make sure template can be added to transclusion
		return transclusion.addPart( template ).then( function () {
			// Test target method
			ve.ui.CitoidInspector.static.populateTemplate( template, citation );

			// Make sure serialised template matches expected data
			assert.deepEqual( template.serialize().template, expected );
		} );

	}

	/* Tests */

	QUnit.test( 'Create template with using valid templateData', function ( assert ) {
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					title: {
						wt: 'Example Domain'
					},
					url: {
						wt: 'http://www.example.com/'
					},
					isbn: {
						wt: '978-3-16-148410-0'
					},
					first: {
						wt: 'First'
					},
					last: {
						wt: 'Last'
					},
					first2: {
						wt: 'First2'
					},
					last2: {
						wt: 'Last2'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain', // Test example of flat field
				itemType: 'webpage',
				url: 'http://www.example.com/',
				isbn: [ // Test example of Array
					'978-3-16-148410-0',
					'this text should not appear anywhere'
				],
				author: [ // Test example of 2D Array
					[ 'First', 'Last' ],
					[ 'First2', 'Last2' ]
				]
			},
			maps = {
				citoid: {
					title: 'title',
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: [ 'isbn' ],
					author: [
						[ 'first', 'last' ],
						[ 'first2', 'last2' ],
						[ 'first3', 'last3' ],
						[ 'first4', 'last4' ],
						[ 'first5', 'last5' ],
						[ 'first6', 'last6' ],
						[ 'first7', 'last7' ],
						[ 'first8', 'last8' ],
						[ 'first9', 'last9' ]
					],
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );

	QUnit.test( 'Invalid templateData; String (cit) / Array (td) mismatch', function ( assert ) {
		// This test mismatches a flat field in the citation data (title) with an Array in the
		// TemplateData. Expected result is for the field to be skipped in the resulting template,
		// and for no VE errors to be thrown.
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					url: {
						wt: 'http://www.example.com/'
					},
					isbn: {
						wt: '978-3-16-148410-0'
					},
					first: {
						wt: 'First'
					},
					last: {
						wt: 'Last'
					},
					first2: {
						wt: 'First2'
					},
					last2: {
						wt: 'Last2'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain',
				itemType: 'webpage',
				url: 'http://www.example.com/',
				isbn: [
					'978-3-16-148410-0',
					'this text should not appear anywhere'
				],
				author: [
					[ 'First', 'Last' ],
					[ 'First2', 'Last2' ]
				]
			},
			maps = {
				citoid: {
					title: [ 'title' ], // Bad line of template data - should be String
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: [ 'isbn' ],
					author: [
						[ 'first', 'last' ],
						[ 'first2', 'last2' ],
						[ 'first3', 'last3' ],
						[ 'first4', 'last4' ],
						[ 'first5', 'last5' ],
						[ 'first6', 'last6' ],
						[ 'first7', 'last7' ],
						[ 'first8', 'last8' ],
						[ 'first9', 'last9' ]
					],
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );

	QUnit.test( 'Invalid templateData; String (cit) / 2D Array (td) mismatch', function ( assert ) {
		// This test mismatches a flat field in the citation data (title) with a 2D Array in the TemplateData
		// Expected result is for the field to be skipped in the resulting template, and for no VE
		// errors to be thrown.
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					url: {
						wt: 'http://www.example.com/'
					},
					isbn: {
						wt: '978-3-16-148410-0'
					},
					first: {
						wt: 'First'
					},
					last: {
						wt: 'Last'
					},
					first2: {
						wt: 'First2'
					},
					last2: {
						wt: 'Last2'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain',
				itemType: 'webpage',
				url: 'http://www.example.com/',
				isbn: [
					'978-3-16-148410-0',
					'this text should not appear anywhere'
				],
				author: [
					[ 'First', 'Last' ],
					[ 'First2', 'Last2' ]
				]
			},
			maps = {
				citoid: {
					title: [ [ 'title' ] ], // Bad line of template data - should be String
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: [ 'isbn' ],
					author: [
						[ 'first', 'last' ],
						[ 'first2', 'last2' ],
						[ 'first3', 'last3' ],
						[ 'first4', 'last4' ],
						[ 'first5', 'last5' ],
						[ 'first6', 'last6' ],
						[ 'first7', 'last7' ],
						[ 'first8', 'last8' ],
						[ 'first9', 'last9' ]
					],
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );

	QUnit.test( 'Mismatched templateData; Array (cit) / String (td) mismatch', function ( assert ) {
		// This test mismatches an Array in the citation data (isbn) with a flat field in the TemplateData
		// Expected result is for the array to be turned into a string with the fields separated by
		// a comma, and for no VE errors to be thrown.
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					title: {
						wt: 'Example Domain'
					},
					url: {
						wt: 'http://www.example.com/'
					},
					isbn: {
						wt: '978-3-16-148410-0, 978-9-99-999999-x'
					},
					first: {
						wt: 'First'
					},
					last: {
						wt: 'Last'
					},
					first2: {
						wt: 'First2'
					},
					last2: {
						wt: 'Last2'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain',
				itemType: 'webpage',
				url: 'http://www.example.com/',
				isbn: [ // Test example of Array
					'978-3-16-148410-0',
					'978-9-99-999999-x'
				],
				author: [
					[ 'First', 'Last' ],
					[ 'First2', 'Last2' ]
				]
			},
			maps = {
				citoid: {
					title: 'title',
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: 'isbn', // Bad line of template data - should be Array
					author: [
						[ 'first', 'last' ],
						[ 'first2', 'last2' ],
						[ 'first3', 'last3' ],
						[ 'first4', 'last4' ],
						[ 'first5', 'last5' ],
						[ 'first6', 'last6' ],
						[ 'first7', 'last7' ],
						[ 'first8', 'last8' ],
						[ 'first9', 'last9' ]
					],
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );

	QUnit.test( 'Mismatched templateData; Array (cit) / 2D Array (td) mismatch', function ( assert ) {
		// This test mismatches a Array in the citation data (isbn) with a flat field in the TemplateData
		// Expected result is for the field to be skipped in the resulting template, and for no VE
		// errors to be thrown.
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					title: {
						wt: 'Example Domain'
					},
					url: {
						wt: 'http://www.example.com/'
					},
					first: {
						wt: 'First'
					},
					last: {
						wt: 'Last'
					},
					first2: {
						wt: 'First2'
					},
					last2: {
						wt: 'Last2'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain',
				itemType: 'webpage',
				url: 'http://www.example.com/',
				isbn: [
					'978-3-16-148410-0',
					'this text should not appear anywhere'
				],
				author: [
					[ 'First', 'Last' ],
					[ 'First2', 'Last2' ]
				]
			},
			maps = {
				citoid: {
					title: 'title',
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: [ [ 'isbn' ] ], // Bad line of template data - should be 1D array
					author: [
						[ 'first', 'last' ],
						[ 'first2', 'last2' ],
						[ 'first3', 'last3' ],
						[ 'first4', 'last4' ],
						[ 'first5', 'last5' ],
						[ 'first6', 'last6' ],
						[ 'first7', 'last7' ],
						[ 'first8', 'last8' ],
						[ 'first9', 'last9' ]
					],
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );

	QUnit.test( 'Mismatched templateData; 2D Array (cit) / Array (td) mismatch', function ( assert ) {
		// This test mismatches a 2D Array in the citation data (author) with a 1D array in the
		// TemplateData. Expected result is for the inner fields to be concatenated with a space divider,
		// and for no VE errors to be thrown.
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					title: {
						wt: 'Example Domain'
					},
					url: {
						wt: 'http://www.example.com/'
					},
					isbn: {
						wt: '978-3-16-148410-0'
					},
					last: {
						wt: 'First Last'
					},
					last2: {
						wt: 'First2 Last2'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain',
				itemType: 'webpage',
				url: 'http://www.example.com/',
				isbn: [
					'978-3-16-148410-0',
					'this text should not appear anywhere'
				],
				author: [
					[ 'First', 'Last' ],
					[ 'First2', 'Last2' ]
				]
			},
			maps = {
				citoid: {
					title: 'title',
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: [ 'isbn' ],
					author: [ // Mismatched template data - should be 2D Array
						'last',
						'last2',
						'last3'
					],
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );

	QUnit.test( 'Mismatched templateData; 2D Array (cit) / String (td) mismatch', function ( assert ) {
		// This test mismatches a 2D Array in the citation data (author) with a flat field in the TemplateData
		// Expected result is for the fields to be concatenated, with the inner fields separated with a space,
		// and the outer fields to be separated by a comma.

		// No VE errors should be thrown.
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					title: {
						wt: 'Example Domain'
					},
					url: {
						wt: 'http://www.example.com/'
					},
					isbn: {
						wt: '978-3-16-148410-0'
					},
					last: {
						wt: 'First Last, First2 Last2'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain',
				itemType: 'webpage',
				url: 'http://www.example.com/',
				isbn: [
					'978-3-16-148410-0',
					'this text should not appear anywhere'
				],
				author: [
					[ 'First', 'Last' ],
					[ 'First2', 'Last2' ]
				]
			},
			maps = {
				citoid: {
					title: 'title',
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: [ 'isbn' ],
					author: 'last', // Bad line of template data - should be 2D array
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );

	QUnit.test( 'Unbalanced templateData; mixed String and Array', function ( assert ) {
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					title: {
						wt: 'Example Domain'
					},
					url: {
						wt: 'http://www.example.com/'
					},
					isbn: {
						wt: '978-3-16-148410-0'
					},
					first: {
						wt: 'First'
					},
					last: {
						wt: 'Last'
					},
					last2: {
						wt: 'First2 Last2'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain',
				itemType: 'webpage',
				url: 'http://www.example.com/',
				isbn: [
					'978-3-16-148410-0',
					'this text should not appear anywhere'
				],
				author: [
					[ 'First', 'Last' ],
					[ 'First2', 'Last2' ]
				]
			},
			maps = {
				citoid: {
					title: 'title',
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: [ 'isbn' ],
					author: [ // Jagged array
						[ 'first', 'last' ],
						'last2',
						[ 'first3', 'last3' ]
					],
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );

	QUnit.test( 'Unbalanced templateData; jagged Array', function ( assert ) {
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					title: {
						wt: 'Example Domain'
					},
					url: {
						wt: 'http://www.example.com/'
					},
					isbn: {
						wt: '978-3-16-148410-0'
					},
					first: {
						wt: 'First'
					},
					last: {
						wt: 'Last'
					},
					first2: {
						wt: 'First2'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain',
				itemType: 'webpage',
				url: 'http://www.example.com/',
				isbn: [
					'978-3-16-148410-0',
					'this text should not appear anywhere'
				],
				author: [
					[ 'First', 'Last' ],
					[ 'First2', 'Last2' ]
				]
			},
			maps = {
				citoid: {
					title: 'title',
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: [ 'isbn' ],
					author: [ // Jagged array
						[ 'first', 'last' ],
						[ 'first2' ],
						[ 'first3', 'last3' ]
					],
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );

	QUnit.test( 'Unbalanced citation; mixed String and Array', function ( assert ) {
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					title: {
						wt: 'Example Domain'
					},
					url: {
						wt: 'http://www.example.com/'
					},
					isbn: {
						wt: '978-3-16-148410-0'
					},
					first: {
						wt: 'First'
					},
					last: {
						wt: 'Last'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain',
				itemType: 'webpage',
				url: 'http://www.example.com/',
				isbn: [
					'978-3-16-148410-0',
					'this text should not appear anywhere'
				],
				author: [ // Mixed strings and list inside list
					[ 'First', 'Last' ],
					'First2'
				]
			},
			maps = {
				citoid: {
					title: 'title',
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: [ 'isbn' ],
					author: [
						[ 'first', 'last' ],
						[ 'first2', 'last2' ]
					],
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );

	QUnit.test( 'Empty strings in citation; Flat parameter', function ( assert ) {
		// Test should not add parameters where the citation value is an empty string
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					title: {
						wt: 'Example Domain'
					},
					url: {
						wt: 'http://www.example.com/'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain',
				itemType: 'webpage',
				url: 'http://www.example.com/',
				publisher: ''
			},
			maps = {
				citoid: {
					title: 'title',
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: [ 'isbn' ],
					author: [
						[ 'first', 'last' ],
						[ 'first2', 'last2' ],
						[ 'first3', 'last3' ]
					],
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );

	QUnit.test( 'Empty strings in citation; 1D Array', function ( assert ) {
		// Test should not add parameters where the citation value is an empty string
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					title: {
						wt: 'Example Domain'
					},
					url: {
						wt: 'http://www.example.com/'
					},
					first: {
						wt: 'First'
					},
					last: {
						wt: 'Last'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain',
				itemType: 'webpage',
				url: 'http://www.example.com/',
				isbn: [
					'', // Empty string- should not be added
					'this text should not appear anywhere'
				],
				author: [
					[ 'First', 'Last' ]
				]
			},
			maps = {
				citoid: {
					title: 'title',
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: [ 'isbn' ],
					author: [
						[ 'first', 'last' ],
						[ 'first2', 'last2' ],
						[ 'first3', 'last3' ]
					],
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );

	QUnit.test( 'Empty strings in citation; 2D Array', function ( assert ) {
		// Test should not add parameters where the citation value is an empty string
		// Empty strings are expected in the authors field occasionally from citoid
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					title: {
						wt: 'Example Domain'
					},
					url: {
						wt: 'http://www.example.com/'
					},
					isbn: {
						wt: '978-3-16-148410-0'
					},
					first: {
						wt: 'First'
					},
					last: {
						wt: 'Last'
					},
					last2: {
						wt: 'Last2'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain',
				itemType: 'webpage',
				url: 'http://www.example.com/',
				isbn: [
					'978-3-16-148410-0',
					'this text should not appear anywhere'
				],
				author: [
					[ 'First', 'Last' ],
					[ '', 'Last2' ]
				]
			},
			maps = {
				citoid: {
					title: 'title',
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: [ 'isbn' ],
					author: [
						[ 'first', 'last' ],
						[ 'first2', 'last2' ],
						[ 'first3', 'last3' ]
					],
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );

	QUnit.test( 'Invalid templateData; Object in citation and templateData', function ( assert ) {
		// This test mismatches a flat field in the citation data with an Object in the TemplateData
		// (title).

		// It also has an object in the citation (author). Neither of these situations should occur in
		// the wild, as citoid should not return Objects as values, and the templateData extension should
		// prevent any Objects as values from being saved.
		//
		// Expected result is for the fields to be skipped in the resulting template, and for no VE
		// errors to be thrown.
		var expected = {
				target: {
					wt: 'Cite web',
					href: './Template:Cite_web'
				},
				params: {
					url: {
						wt: 'http://www.example.com/'
					},
					isbn: {
						wt: '978-3-16-148410-0'
					}
				},
				i: 0
			},
			citation =
			{
				title: 'Example Domain',
				itemType: 'webpage',
				url: 'http://www.example.com/',
				isbn: [
					'978-3-16-148410-0',
					'this text should not appear anywhere'
				],
				author: {
					first: 'first',
					last: 'last'
				}
			},
			maps = {
				citoid: {
					title: { title: 'title' }, // Bad line of template data- this is actually disallowed by the templateData extension
					url: 'url',
					publicationTitle: 'website',
					publisher: 'publisher',
					date: 'date',
					PMCID: 'pmc',
					PMID: 'pmid',
					pages: 'pages',
					series: 'series',
					accessDate: 'accessdate',
					DOI: 'doi',
					language: 'language',
					isbn: [ 'isbn' ],
					author: [
						[ 'first', 'last' ],
						[ 'first2', 'last2' ],
						[ 'first3', 'last3' ],
						[ 'first4', 'last4' ],
						[ 'first5', 'last5' ],
						[ 'first6', 'last6' ],
						[ 'first7', 'last7' ],
						[ 'first8', 'last8' ],
						[ 'first9', 'last9' ]
					],
					editor: [
						[ 'editor-first', 'editor-last' ]
					]
				}
			};

		return testMaps( maps, citation, expected, assert );

	} );
}() );
