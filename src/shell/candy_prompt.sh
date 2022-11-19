#!/bin/sh
# A tool to add a widget to the prompt in order for cmdline users not to forget using their candies :)
#
# Usage: Copy the script to a directory in $PATH,
#   and modify the config of shell to call the script with -p as argument and fill the output into the prompt
#   every time evaluating the prompt.
#
#   Since the script can't know when its user candied,
#   it should be called without argument to update last candied time.

# The path to the file containing the timestamp of last candy
[ -z "$TIMESTAMP_PATH" ] && TIMESTAMP_PATH="${XDG_CACHE_HOME:=$HOME}/candy_timestamp.txt"
# The timeouts for color changing, by hours, separated with space
[ -z "$CANDY_TIMEOUTS" ] && CANDY_TIMEOUTS="24 36"
# The color code for different timeout, in ANSI color code, separated with space
[ -z "$CANDY_COLORS" ] && CANDY_COLORS="42;37 43;37 41;37"

# If invoking without arguments, update candy time and quit
if [ -z "$1" ]; then
    date +%s > "$TIMESTAMP_PATH"
    exit
fi
# Otherwise, output time from last candy

dt="$((($(date +%s) - $(cat "$TIMESTAMP_PATH")) / 3600))"

function print_time() {
    for fmt in $CANDY_COLORS; do
        local color=$fmt
        if [[ $i -eq 0 ]]; then
            break
        else
            i=$(($i - 1))
        fi
    done
    printf "\e[%sm%d hours\e[0m" $color $dt
}

i=0
for timeout in $CANDY_TIMEOUTS; do
    if [[ $dt -lt $timeout ]]; then
        ok=1
        print_time $i
        break
    else
        i=$(($i + 1))
    fi
done
[ -z "$ok" ] && print_time $i

