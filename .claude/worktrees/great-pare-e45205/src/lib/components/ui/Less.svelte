<script>
    export let text = "";
    export let maxLength = 100;

    let expanded = false;

    $: isTruncated = text.length > maxLength;
    $: displayText =
        !isTruncated || expanded ? text : text.slice(0, maxLength) + "...";
</script>

<span>{displayText}</span>
