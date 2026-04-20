<script lang="ts">
  import View from "$lib/components/ui/View.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Logo from "$lib/components/Logo.svelte";

  import {
    ShieldCheck,
    GraduationCap,
    Building2,
    ArrowRight,
  } from "lucide-svelte";
  import { BRAND } from "$lib/constants/branding";

  let { data } = $props();
</script>

<View center fullScreen>
  <main class="hero" data-aos="zoom-in">
    <div class="logo-box">
      <Logo width="240px" />
    </div>

    <div class="text-content">
      <h1>PFE Management System</h1>
      <p>
        Secure authentication for {BRAND.university.name} students, teachers, and
        partner companies.
      </p>
    </div>

    <div class="action-cards">
      {#if data.user}
        <div class="logged-in-card" data-aos="fade-up" data-aos-delay="200">
          <div class="user-info">
            <ShieldCheck size="3rem" color="var(--color-accent)" />
            <h2>Welcome back, {data.user.name.split(" ")[0]}!</h2>
            <p>You are logged in as <strong>{data.user.role}</strong>.</p>
          </div>
          <Button
            href="/dashboard"
            variant="cta"
            large
            Icon={ArrowRight}
            iconPosition="right"
          >
            Go to Dashboard
          </Button>
        </div>
      {:else}
        <div class="auth-grid" data-aos="fade-up" data-aos-delay="200">
          <div class="auth-card">
            <GraduationCap size="3rem" />
            <h3>University Account</h3>
            <p>Students and Teachers</p>
            <Button href="/accounts/login" variant="primary" autoWidth
              >Login</Button
            >
          </div>

          <div class="auth-card secondary">
            <Building2 size="3rem" />
            <h3>Company Account</h3>
            <p>External Partners</p>
            <Button href="/accounts/company/login" variant="third" autoWidth
              >Partner Portal</Button
            >
          </div>
        </div>
      {/if}
    </div>
  </main>
</View>

<style>
  .hero {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
    padding: 2rem;
    max-width: 900px;
  }

  .text-content {
    h1 {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
      background: linear-gradient(
        135deg,
        var(--color-text) 0%,
        var(--color-accent) 100%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      font-size: 1.2rem;
      color: var(--color-text-muted);
      max-width: 600px;
      margin: 0 auto;
    }
  }

  .action-cards {
    width: 100%;
  }

  .logged-in-card {
    background: var(--color-background-100);
    border: 1px solid var(--color-background-200);
    padding: 3rem;
    border-radius: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

    .user-info {
      h2 {
        font-size: 2rem;
        margin: 1rem 0 0.5rem;
      }
      p {
        color: var(--color-text-muted);
        font-size: 1.1rem;
      }
    }
  }

  .auth-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    width: 100%;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }

  .auth-card {
    background: var(--color-background-100);
    border: 1px solid var(--color-background-200);
    padding: 2.5rem;
    border-radius: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    transition: transform var(--transition-normal);

    &:hover {
      transform: translateY(-5px);
    }

    h3 {
      font-size: 1.4rem;
      margin: 0.5rem 0 0;
    }

    p {
      color: var(--color-text-muted);
      margin-bottom: 1rem;
    }
  }

  .auth-card.secondary {
    background: color-mix(
      in srgb,
      var(--color-accent) 3%,
      var(--color-background-100)
    );
  }
</style>
