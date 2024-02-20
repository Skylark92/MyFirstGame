import {
  _decorator,
  Component,
  EventMouse,
  Animation,
  Input,
  input,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40;

@ccclass("PlayerController")
export class PlayerController extends Component {
  // 이동한 횟수 저장
  private _curMoveIndex: number = 0;
  // Player가 점프하는 지 여부 판단에 사용
  private _startJump: boolean = false;
  // 점프할 횟수 (1, 2)
  private _jumpStep: number = 0;
  // 점프 1회에 걸리는 시간
  private _jumpTime: number = 0.1;
  // Player가 현재 하고 있는 점프의 시간, 이 수치가 _jumpTime에 이르면 점프가 끝남
  private _curJumpTime: number = 0;
  // Player의 현재 수직 속도, 점프할 때 위치의 Y값을 계산하기 위해 사용
  private _curJumpSpeed: number = 0;
  // Player의 현재 위치, 위치 물리 공식 계산할 때 사용(하단의 공식 참고)
  private _curPos: Vec3 = new Vec3();
  // deltaTime마다 계산된 위치
  private _deltaPos: Vec3 = new Vec3(0, 0, 0);
  // Player의 마지막 위치 저장, 점프가 끝났을 때 누적되는 오류?를 방지하기 위해 사용
  private _targetPos: Vec3 = new Vec3();
  // 이동 애니메이션
  @property(Animation)
  BodyAnim: Animation = null;

  start() {}

  update(deltaTime: number) {
    // 화면 업데이트
    if (this._startJump) {
      // 점프 시간 더하기
      this._curJumpTime += deltaTime;
      // 점프 시간에 도달했는지 확인
      if (this._curJumpTime > this._jumpTime) {
        // 점프가 끝나면 Player의 위치를 수정
        this.node.setPosition(this._targetPos);
        // 점프 상태 초기화
        this._startJump = false;

        this.onOnceJumpEnd();
      } else {
        // 움직임이 남았을 경우
        // 현재 위치 복제
        this.node.getPosition(this._curPos);
        // x 위치를 계산
        this._deltaPos.x = this._curJumpSpeed * deltaTime;
        // 원래 위치에 deltaPos를 더한 최종 위치 계산
        Vec3.add(this._curPos, this._curPos, this._deltaPos);
        // 포지션 변경
        this.node.setPosition(this._curPos);
      }
    }
  }

  onMouseUp(event: EventMouse) {
    if (event.getButton() === EventMouse.BUTTON_LEFT) {
      this.jumpByStep(1);
    } else if (event.getButton() === EventMouse.BUTTON_RIGHT) {
      this.jumpByStep(2);
    }
  }

  jumpByStep(step: number) {
    // Player가 점프 중이면 실행 안 함
    if (this._startJump) return;

    this.node.emit("JumpStart", step);
    // 애니메이션 시간에 따라 점프 시간 설정
    const clipName = step === 1 ? "oneStep" : "twoStep";
    const state = this.BodyAnim.getState(clipName);
    this._jumpTime = state.duration;

    // Player 점프 시작
    this._startJump = true;
    // 점프 횟수 저장
    this._jumpStep = step;
    // 새로운 점프 시작
    this._curJumpTime = 0;
    // 속도 계산, 고정된 시간으로 점프를 실행하기 위해서
    this._curJumpSpeed = (this._jumpStep * BLOCK_SIZE) / this._jumpTime;
    // 움직임 계산에 필요한 현재 위치 가져오기
    this.node.getPosition(this._curPos);
    // 점프가 끝날 때 도착 위치 계산
    Vec3.add(
      this._targetPos,
      this._curPos,
      new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0)
    );

    if (this.BodyAnim) {
      if (step === 1) {
        this.BodyAnim.play("oneStep");
      } else if (step === 2) {
        this.BodyAnim.play("twoStep");
      }
    }

    this._curMoveIndex += step;
  }

  setInputActive(active: boolean) {
    if (active) {
      input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    } else {
      input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }
  }

  reset() {
    this._curMoveIndex = 0;
  }

  onOnceJumpEnd() {
    this.node.emit("JumpEnd", this._curMoveIndex);
  }
}

/*
    Final Position = Original Position + Speed * deltaTime
    P_1 = P_0 + v*t
*/
