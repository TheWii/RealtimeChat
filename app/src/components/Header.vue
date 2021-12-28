<template>
<header>
    <div>
        <h1 class="title">Realtime Chat</h1>
        <div>
            <p>Hello, (user.name)!</p>
        </div>
    </div>

    <nav>
        <ul>
            <li><router-link to="/rooms">HOME</router-link></li>
            <li><router-link to="/user/leave">LEAVE</router-link></li>
        </ul>
    </nav>
</header>
</template>

<script>
export default {
    name: 'Header'
}
</script>

<style lang="scss" scoped>
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.3rem 2rem;
    background: var(--background-nav);

    > div,
    nav > ul {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .title {
        font-size: 1.5rem;
        text-align: center;
        color: var(--text-nav-title);
    }

    a {
        color: var(--text-nav-anchor);
        font-weight: 700;
    }
    a:hover, a:focus, a:active {
        color: var(--text-nav-anchor-dark);
        text-decoration: underline;
    }
}
</style>