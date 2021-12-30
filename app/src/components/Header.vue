<template>
<header>
    <div class="content">
        <h1 class="title">Realtime Chat</h1>
        <nav>
            <ul>
            </ul>
        </nav>
    </div>
</header>
</template>

<script>
export default {
    name: 'Header'
}
</script>

<style lang="scss" scoped>
header {
    background: var(--background-nav);
    box-shadow: 0 0 0.75rem rgba(0, 0, 0, 0.075);

    .content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 2rem;
        margin: 0 auto;
        height: 3.75rem;
        max-width: 70em;
    }

    .title {
        font-size: 1.5rem;
        color: var(--text-nav-title);
    }
}
</style>