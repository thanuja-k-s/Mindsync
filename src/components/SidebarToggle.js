import React, { useEffect, useState } from 'react';

export default function SidebarToggle() {
  const user = localStorage.getItem('user');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const isOpen = document.body.classList.contains('sidebar-open');
      setVisible(!isOpen);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!user || !visible) return null;

  return (
    <button
      className="sidebar-toggle-floating"
      aria-label="Open sidebar"
      title="Open sidebar"
      onClick={() => window.dispatchEvent(new Event('sidebar:open'))}
    >
      ⟵
    </button>
  );
}
