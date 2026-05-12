<script>
    import Logo from "$lib/components/Logo.svelte";
    import View from "$lib/components/ui/View.svelte";
    import LoginGoogle from "$lib/components/ui/custom/LoginGoogle.svelte";
    import LoginDev from "$lib/components/ui/custom/LoginDev.svelte";
    import { BRAND } from "$lib/constants/branding";

    import { Building2 } from "lucide-svelte";

    let { data } = $props();
</script>

<View fullScreen center>
    <main data-aos="flip-left">
        <div class="card-wrapper">
            <Logo width="180px" />

            <div class="header">
                <h1>Connection</h1>
                <p>Connect with your {BRAND.university.name} Google account.</p>
            </div>

            {#if data.error}
                <div class="error-banner">
                    <p>{data.error}</p>
                </div>
            {/if}

            <div class="cta">
                <LoginGoogle />

                {#if data.showDevButton}
                    <LoginDev autoWidth />
                {/if}
            </div>

            <p class="question">
                <span class="icon">
                    <Building2 size="1.5rem" />
                </span>

                <span class="content">
                    Are you a company?
                    <a href="./company/login">Click here</a>.
                </span>
            </p>
        </div>
    </main>
</View>

<style>
    .card-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;

        gap: 1rem;
    }

    .cta {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .header {
        text-align: center;

        margin-bottom: 4rem;
    }

    .error-banner {
        background: color-mix(in srgb, var(--color-danger) 15%, transparent);
        border: 1px solid var(--color-danger);
        border-radius: 0.5rem;
        padding: 0.75rem 1rem;
        width: 100%;
        text-align: center;

        p {
            color: var(--color-danger);
            font-size: 0.95rem;
            margin: 0;
        }
    }

    .question {
        font-size: 1.2rem;

        display: flex;
        align-items: center;
        gap: 0.5rem;

        .content {
            transform: translateY(2px);
        }
    }
</style>
