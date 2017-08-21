# Cheats
Easily view and interact with cheatsheets using Markdown formatting. It relies on the free GitHub Gist service where you can easily create plain text files using Markdown syntax for formatting. Once you have a document created, access it using a special URL parameter as described below.

## The Basics
An info panel will show in the top right corner (not available on mobile devices) that provides easy access to stats, a table of contents and some other helpful links.

## URL Parameters
A number of URL paramaters are provided to make it easier to access documents in readily usable ways. They're accessed by simple adding a `&` symbol then the url parameter's name followed by an `=` sign and a value.  

URL paramaters available:
- `gist` - a GitHub Gist id.
- `css` - an optional GitHub Gist id for custom CSS styling.
- `columns` - the number of columns the cheatsheet will render.
- `fontsize` - a percentage designating default font size.
- `showonly` - a comma-separated string of sections to render.

Examples:
- Change number of columns to 1:  
https://ugotsta.github.io/cheats/?columns=1
- Change number of columns to 1 and default font size to 100%:  
https://ugotsta.github.io/cheats/?columns=2&fontsize=100

## Printing
<kbd>Control</kbd> + <kbd>P</kbd> (or <kbd>Command</kbd> + <kbd>P</kbd> on Mac) should yield relatively nice results as the app attempts to optimize documents for the simplest and most elegant printing experience. This can be further honed using the options provided.

Please note, printing of background graphics and colors is often disabled in browsers. Many browsers include an option to include them. In Chrome, for example, after opting to print, click `+More settings` then under `Options`, tick `Background graphics`.

## Keyboard Commands
<kbd>?</kbd> or <kbd>/</kbd> - Hide/show the Info panel.  
<kbd>h</kbd> or <kbd>H</kbd> - Same as above but added for ease of use.

## Example Gists
- [Alexa Cheats](https://ugotsta.github.io/cheats/?gist=2a06603706fd7c2eb5c93f34ed316354&variations=true) - Fun commands for Amazon Alexa.
- [Screen Cheatsheet](https://ugotsta.github.io/cheats/?gist=af918e1618682638aa82) - Helpful commands for Screen.
- [RegexCheatsheet](https://ugotsta.github.io/cheats/?gist=9e729e1f52cef218da9c9d6ce4bce7bb&heading=h1&header=h6) - Easy reference for regular expressions.
- [Cucumber Cheatsheet](https://ugotsta.github.io/cheats/?gist=5728701&columns=2) - Tips and shortcuts for Cucumber testing tool.

## Example CSS Themes
- [Vintage Western](https://ugotsta.github.io/cheats/?css=686ce03846004fd858579392ca0db2c1) - Straight out the old west.
- [Corkboard](https://ugotsta.github.io/cheats/?css=ada930f9dae1d0a8d95f41cb7a56d658) - Lively corkboard theme with CSS pins.
- [Alexa Cheats](https://ugotsta.github.io/cheats/?&css=3340cb9dcb273289b51aef3570f5304d&variations=true) - Port of theme from [Alexa Cheats](https://ugotsta.github.io/alexa-cheats/).
- [Alternating Colors](https://ugotsta.github.io/cheats/?css=e774fa60940e2dc452d78e8382798a2c) - Flat but colorful theme.
- [Spacious](https://ugotsta.github.io/cheats/?css=160db22223834d33b08337cebbbba94e) - Spacious with subtle colors.