<script lang="ts">
  import View from "$lib/components/ui/View.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { LogOut, User, Mail, Shield, Calendar, Globe } from "lucide-svelte";
  import { enhance } from "$app/forms";

  let { data } = $props();
  const user = data.user;
</script>

<View center fullScreen>
  <main class="dashboard-container" data-aos="fade-up">
    {#if user}
      <div class="profile-card">
        <header class="profile-header">
          <div class="avatar-wrapper">
            {#if user.picture}
              <img src={user.picture} alt={user.name} class="avatar" />
            {:else}
              <div class="avatar-placeholder">
                <User size="3rem" />
              </div>
            {/if}
            <div class="status-badge" title="Active Session"></div>
          </div>
          <h1>Welcome, {user.name}</h1>
          <p class="role-badge">{user.role}</p>
        </header>

        <section class="info-grid">
          <div class="info-item">
            <div class="icon-box"><Mail size="1.2rem" /></div>
            <div class="info-content">
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
          </div>

          <div class="info-item">
            <div class="icon-box"><Shield size="1.2rem" /></div>
            <div class="info-content">
              <span>Role</span>
              <strong>{user.role}</strong>
            </div>
          </div>

          <div class="info-item">
            <div class="icon-box"><Globe size="1.2rem" /></div>
            <div class="info-content">
              <span>Auth Provider</span>
              <strong>{user.provider}</strong>
            </div>
          </div>

          <div class="info-item">
            <div class="icon-box"><Calendar size="1.2rem" /></div>
            <div class="info-content">
              <span>Joined</span>
              <strong>{new Date(user.createdAt).toLocaleDateString()}</strong>
            </div>
          </div>
        </section>

        <footer class="profile-footer">
          <form method="POST" action="/auth/logout" use:enhance>
            <Button variant="error" Icon={LogOut} isSubmit uppercase large>
              Sign Out
            </Button>
          </form>
        </footer>
      </div>
    {:else}
      <div class="error-state">
        <Shield size="4rem" color="var(--color-danger)" />
        <h2>Access Denied</h2>
        <p>You are not authenticated. How did you get here?</p>
        <Button href="/accounts/login" variant="primary" large>Go to Login</Button>
      </div>
    {/if}
  </main>
</View>

<style>
  .dashboard-container {
    width: 100%;
    max-width: 600px;
    padding: 2rem;
  }

  .profile-card {
    background: var(--color-background-100);
    border: 1px solid var(--color-background-200);
    border-radius: 2rem;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }

  .profile-header {
    background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-fixed) 100%);
    padding: 3rem 2rem;
    text-align: center;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
    }
  }

  .avatar-wrapper {
    position: relative;
    margin-bottom: 0.5rem;
  }

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid rgba(255, 255, 255, 0.3);
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 4px solid rgba(255, 255, 255, 0.3);
  }

  .status-badge {
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 20px;
    height: 20px;
    background: #10b981;
    border: 3px solid var(--color-accent);
    border-radius: 50%;
  }

  .role-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.4rem 1.2rem;
    border-radius: 999px;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    backdrop-filter: blur(4px);
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    padding: 2.5rem;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 1rem;

    .icon-box {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--color-background-200);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-accent);
    }

    .info-content {
      display: flex;
      flex-direction: column;

      span {
        font-size: 0.8rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      strong {
        font-size: 1rem;
        color: var(--color-text);
        word-break: break-all;
      }
    }
  }

  .profile-footer {
    padding: 0 2.5rem 2.5rem;
    display: flex;
    justify-content: center;
    
    form {
      width: 100%;
      display: flex;
    }
  }

  .error-state {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    
    h2 {
      font-size: 2rem;
      margin: 0;
    }
    
    p {
      color: var(--color-text-muted);
      margin: 0 0 1rem 0;
    }
  }
</style>
