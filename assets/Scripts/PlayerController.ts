import {
  _decorator,
  Component,
  EventMouse,
  Input,
  input,
  Node,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerController")
export class PlayerController extends Component {
  // Player가 점프하는 지 여부 판단에 사용
  private _startJump: boolean = false;
  // 점프할 횟수 (1, 2)
  private _jumpStep: number = 0;
  // 점프 1회에 걸리는 시간
  private _jumpTime: number = 0.1;
  // Player가 현재 하고 있는 점프의 시간, 이 수치가 _jumpTime에 이르면 점프가 끝남
  private _curlJumpTime: number = 0;
  // Player의 현재 수직 속도, 점프할 때 위치의 Y값을 계산하기 위해 사용
  private _curlJumpSpeed: number = 0;
  // Player의 현재 위치, 위치 물리 공식 계산할 때 사용(하단의 공식 참고)
  private _curPos: Vec3 = new Vec3();
  // deltaTime마다 계산된 위치
  private _deltaPos: Vec3 = new Vec3(0, 0, 0);
  // Player의 마지막 위치 저장, 점프가 끝났을 때 누적되는 오류?를 방지하기 위해 사용
  private _targetPos: Vec3 = new Vec3();

  start() {
    input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
  }

  update(deltaTime: number) {}

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

    // Player 점프 시작
    this._startJump = true;
    // 점프 횟수 저장
    this._jumpStep = step;
    // 새로운 점프 시작
    this._curlJumpTime = 0;
    // 속도 계산, 고정된 시간으로 점프를 실행하기 위해서
    this._curlJumpSpeed = this._jumpStep / this._jumpTime;
    // 움직임 계산에 필요한 현재 위치 가져오기
    this.node.getPosition(this._curPos);
    // 점프가 끝날 때 도착 위치 계산
    Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0));
  }
}

/*
    Final Position = Original Position + Speed * deltaTime
    P_1 = P_0 + v*t
*/
