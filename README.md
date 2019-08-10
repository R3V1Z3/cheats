# CHEATS
Easily view and interact with cheatsheets hosted for free through [GitHub Gist](https://gist.github.com/) service, where you can easily create plain text files using Markdown syntax for formatting. Once you have a document created, view it through CHEATScheat using a special URL parameter as described below.

## The Basics
An info panel will show in the top right corner (not available on mobile devices) that provides easy access to stats, a table of contents and some other helpful links.

## Keyboard Commands
<kbd>F1</kbd> - Hide/show the Info panel.  
<kbd>Esc</kbd> - Hide any open options such as the Gist and CSS selectors.  

## Printing
<kbd>Control</kbd> + <kbd>P</kbd> (or <kbd>Command</kbd> + <kbd>P</kbd> on Mac) should yield relatively nice results as the app attempts to optimize documents for the simplest and most elegant printing experience. This can be further honed using the options provided.

Please note, printing of background graphics and colors is often disabled in browsers. Many browsers include an option to include them. In Chrome, for example, after opting to print, click `+More settings` then under `Options`, tick `Background graphics`.

## URL Parameters
A number of URL paramaters are provided to make it easier to access documents in readily usable ways. They're accessed by simple adding a `&` symbol then the url parameter's name followed by an `=` sign and a value.  

URL paramaters available:
- `gist` - a GitHub Gist id.
- `css` - an optional GitHub Gist id for custom CSS styling.
- `columns` - the number of columns the cheatsheet will render.
- `fontsize` - a percentage designating default font size.
- `header` - optional HTML tag to use for the header.
- `heading` - optional tag to use for sections headings.
- `variations` - set to true to allow variations in cheatsheets for Amazon Alexa commands.
- `showonly` - a comma-separated string of sections to render.

## Example Parameters
URL parameters can take effort to learn and use. Here are some examples to help simplify them.
- Change number of columns to 1: [?columns=1](?columns=1)
- Change number of columns to 2 and default font size to 100%: [?columns=2&fontsize=100](?columns=2&fontsize=100)

## Built for GitHub Pages
CHEATScheat is designed for use with [GitHub Pages](https://pages.github.com/) and made to be easily forked. This file contains hidden options for use when forked.

Options are hidden using HTML comment tags like so:
```
<!-- [options: hide_info=false, parameters_disallowed=css|header|heading] -->
```

Options available:
- `hide_info` - makes the info panel totally inaccessible.
- `hide_github_fork` - hides the graphic link to fork the project on GitHub.
- `hide_command_count` - hide the command count.
- `hide_gist_details` - hides the gist details section.
- `hide_css_details` - hides the css details section.
- `hide_toc` - hides the table of contents.
- `disable_hide` - disable hiding of the info panel.
- `parameters_disallowed` - a list of URL parameters to disallow, separated by |

# CHEATS `🅑-nav`

`ⓘ The code below designates a list of content sources the user will be able to select from in the app.`

Markdown cheatsheet viewer

-----

content `🅑-datalist`
- [Alexa Cheats](https://gist.github.com/2a06603706fd7c2eb5c93f34ed316354)
- [Tmux Cheatsheet](https://gist.github.com/2961058)
- [Screen Cheatsheet](https://gist.github.com/af918e1618682638aa82)
- [Regular Expression Cheatsheet](https://gist.github.com/3893f6ac9447f7ee27fe)
- [Markdown resources](https://gist.github.com/eba62d45c82d0767a5a0)
- [An exhibit of Markdown](https://gist.github.com/deb74713e6aff8fdfce2)
- [Vim Cheats](https://gist.github.com/c002acb756d5cf09b1ad98494a81baa3)

## Appearance `🅑-collapsible`

css `🅑-datalist`
- [Alexa Cheats](https://gist.github.com/3340cb9dcb273289b51aef3570f5304d) - Port of theme from [Alexa Cheats](https://ugotsta.github.io/alexa-cheats/).

columns `🅑-slider="2,1,4,1"`

`🅑-theme-variables`

## Contents `🅑-collapsible`

`🅑-toc`

## Help `🅑-group`

`🅑-help`
`🅑-hide`
