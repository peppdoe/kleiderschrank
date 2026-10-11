import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Toast, useNoticeTimer, type Notice } from './Toast';

afterEach(() => vi.useRealTimers());

describe('Toast', () => {
  it('reports when its action is held by focus or a pointer', () => {
    const onHold = vi.fn();
    render(<Toast notice={{ text: 'Teil gelöscht', action: { label: 'Rückgängig', run: () => {} } }} onHold={onHold} />);
    const undo = screen.getByRole('button', { name: 'Rückgängig' });
    fireEvent.focus(undo);
    expect(onHold).toHaveBeenLastCalledWith(true);
    fireEvent.blur(undo);
    expect(onHold).toHaveBeenLastCalledWith(false);
    fireEvent.pointerEnter(undo.parentElement!);
    expect(onHold).toHaveBeenLastCalledWith(true);
    fireEvent.pointerLeave(undo.parentElement!);
    expect(onHold).toHaveBeenLastCalledWith(false);
  });
});

describe('useNoticeTimer', () => {
  const undoNotice: Notice = { text: 'Teil gelöscht', action: { label: 'Rückgängig', run: () => {} } };

  it('clears a plain notice after 3.5 s and one with an action after 6 s', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { rerender } = renderHook(({ notice }) => useNoticeTimer(notice, false, onExpire), {
      initialProps: { notice: { text: 'Teil gespeichert' } as Notice },
    });
    act(() => vi.advanceTimersByTime(3400));
    expect(onExpire).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));
    expect(onExpire).toHaveBeenCalledTimes(1);

    rerender({ notice: undoNotice });
    act(() => vi.advanceTimersByTime(5900));
    expect(onExpire).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(200));
    expect(onExpire).toHaveBeenCalledTimes(2);
  });

  it('waits while the notice is held and starts over once it is let go', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { rerender } = renderHook(({ held }) => useNoticeTimer(undoNotice, held, onExpire), {
      initialProps: { held: false },
    });
    act(() => vi.advanceTimersByTime(5000));
    rerender({ held: true });
    act(() => vi.advanceTimersByTime(60000));
    expect(onExpire).not.toHaveBeenCalled();
    rerender({ held: false });
    act(() => vi.advanceTimersByTime(5900));
    expect(onExpire).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
