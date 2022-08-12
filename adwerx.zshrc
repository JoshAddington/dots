# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH="/Users/joshaddington/.oh-my-zsh"

# Set name of the theme to load. Optionally, if you set this to "random"
# it'll load a random theme each time that oh-my-zsh is loaded.
# See https://github.com/robbyrussell/oh-my-zsh/wiki/Themes
ZSH_THEME="theunraveler"

BULLETTRAIN_PROMPT_ORDER=(
  git
  dir
  time
)

plugins=(
  git
  docker
  docker-compose
)

source $ZSH/oh-my-zsh.sh


export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$HOME/bin:$HOME/.gem/ruby/2.6.0/bin:$PATH"

# The next line updates PATH for the Google Cloud SDK.
if [ -f '/Users/joshaddington/Downloads/google-cloud-sdk/path.zsh.inc' ]; then . '/Users/joshaddington/Downloads/google-cloud-sdk/path.zsh.inc'; fi

# The next line enables shell command completion for gcloud.
# if [ -f '/Users/joshaddington/Downloads/google-cloud-sdk/completion.zsh.inc' ]; then . '/Users/joshaddington/Downloads/google-cloud-sdk/completion.zsh.inc'; fi
export PATH="/usr/local/opt/mysql@5.7/bin:$PATH"
export PATH="/usr/local/opt/imagemagick@6/bin:$PATH"

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

alias dap="docker exec -it promote_app_1"
alias dp="dockerpromote"
alias rd="restartdocker"
alias cld="closedocker"

alias dc="DISABLE_BULLET=1 CACHE_CLASSES='' HTTPLOG='' docker-compose"
alias dy="dc run --rm app yarn"
alias da="dc run --rm app"
alias dr="dc restart"

alias drs="dc stop sync && dc start sync"
alias dra="dc stop app && dc start app"
alias drx="dc stop nginx && dc start nginx"
alias dras="dc stop assets && dc start assets"
alias drw="dc stop web && dc start web && dra && drx"

alias dslog="docker-compose logs -f sync | awk '/Synchronization/ { print }'"
# alias dsreset="docker-sync stop && docker system prune -a --volumes && docker-sync clean && docker-sync start"

alias snaps="da rm spec/fixtures/snapshots/partner_v2_application.scss.snapshot && da rm spec/fixtures/snapshots/mini_partner_v2_application.scss.snapshot && da bin/rspec spec_redux/services/assets"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

alias glm='~/bin/pull_main.sh'


# The next line updates PATH for the Google Cloud SDK.
if [ -f '/Users/joshaddington/google-cloud-sdk/path.zsh.inc' ]; then . '/Users/joshaddington/google-cloud-sdk/path.zsh.inc'; fi

. /opt/homebrew/opt/asdf/libexec/asdf.sh
